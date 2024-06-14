#!/usr/bin/env node

const {execSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const dockerFileContent = require("./template/docker");
const createValuesYaml = require("./template/create-values-yaml");
const createDeploymentYaml = require("./template/create-deployment-yaml");
const createServiceYaml = require("./template/create-service-yaml");
const createHelpersTpl = require("./template/create-helper-yaml");
const serviceName = process.argv[2];
const serviceDir = path.join(process.cwd(), serviceName);
const helmDir = path.join(serviceDir, 'helm');


if (!serviceName) {
    console.error('Please provide a service name');
    process.exit(1);
}


if (!fs.existsSync(serviceDir)) {
    console.error(`Directory for service ${serviceName} does not exist.`);
    process.exit(1);
}

const buildDockerImage = () => {
    console.log(`Building Docker image for ${serviceName}...`);
    execSync(`docker build -t ${serviceName}:latest .`, {stdio: 'inherit'});
};

const createDockerFile = () => {
    console.log('Creating Dockerfile...');
    fs.writeFileSync('Dockerfile', dockerFileContent.trim());
};

const createHelmChart = () => {
    console.log('Creating Helm chart...');
    if (!fs.existsSync(helmDir)) {
        fs.mkdirSync(helmDir, { recursive: true });
    }
    process.chdir(helmDir);
    execSync(`helm create ${serviceName}`, { stdio: 'inherit' });

    const nestedHelmDir = path.join(helmDir, serviceName);

    // Move files from nested directory to helm directory
    const files = fs.readdirSync(nestedHelmDir);
    files.forEach(file => {
        const oldPath = path.join(nestedHelmDir, file);
        const newPath = path.join(helmDir, file);
        fs.renameSync(oldPath, newPath);
    });

    // Remove the nested directory
    fs.rmdirSync(nestedHelmDir);

    overrideHelmFiles(helmDir, serviceName);
    process.chdir(serviceDir);
};

const overrideHelmFiles = (helmDir, serviceName) => {
    createChartYaml(helmDir);
    createValuesYaml(helmDir, serviceName);
    createDeploymentYaml(helmDir, serviceName);
    createServiceYaml(helmDir, serviceName);
    createHelpersTpl(helmDir, serviceName);
};

const createChartYaml = (helmDir) => {
    const chartYamlContent = `
apiVersion: v2
name: ${serviceName}
description: A Helm chart for ${serviceName}
version: 0.1.0
appVersion: "1.0"
  `;
    fs.writeFileSync(path.join(helmDir, 'Chart.yaml'), chartYamlContent.trim());
};


const stopHelmRelease = () => {
    const helmReleaseName = serviceName;
    console.log(`Stopping existing Helm release ${helmReleaseName}...`);
    try {
        execSync(`helm uninstall ${helmReleaseName}`, {stdio: 'inherit'});
    } catch (error) {
        console.warn(`Helm release ${helmReleaseName} does not exist or failed to uninstall.`);
    }
}

const helmInstall = (helmDir) => {
    const helmReleaseName = serviceName;
    console.log(`Installing ${helmReleaseName} with Helm...`);
    console.log(`helm install ${helmReleaseName} ${helmDir}`)
    execSync(`helm install ${helmReleaseName} ${helmDir}`, {stdio: 'inherit'});
};

const main = () => {
    try {
        process.chdir(serviceDir);
        // execSync(`kubectl config use-context docker-desktop `, {stdio: 'inherit'});
        // createDockerFile();
        buildDockerImage();
        // createHelmChart();
        stopHelmRelease()
        helmInstall(helmDir);
        console.log(`${serviceName} service is up and running.`);
    } catch (error) {
        console.error(`Failed to run service ${serviceName}:`, error);
        process.exit(1);
    }
};

main();

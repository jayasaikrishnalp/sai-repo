const Docker = require('dockerode');

class ValidationService {
  constructor() {
    this.docker = new Docker({ host: 'ttyd-app', port: 2375 });
  }

  async validateCommand(labId, taskId, command) {
    try {
      // Get lab configuration
      const lab = await this.getLabConfig(labId);
      if (!lab) {
        throw new Error('Lab not found');
      }

      // Find the task
      const task = lab.tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Find the specific step that matches the command
      const step = task.steps.find(s => s.command === command);
      if (!step) {
        return {
          passed: false,
          message: 'Command does not match any expected steps'
        };
      }

      // Execute validation based on validation method
      const validation = step.validation;
      let result = false;

      switch (validation.validationMethod) {
        case 'regex':
          result = await this.validateWithRegex(validation);
          break;
        case 'contains':
          result = await this.validateWithContains(validation);
          break;
        case 'custom':
          result = await this.validateWithCustom(validation);
          break;
        default:
          throw new Error('Invalid validation method');
      }

      return {
        passed: result,
        message: result ? 'Task completed successfully' : 'Validation failed'
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        passed: false,
        message: error.message
      };
    }
  }

  async validateWithRegex(validation) {
    try {
      const output = await this.executeCommand(validation.command);
      const regex = new RegExp(validation.expectedOutput);
      return regex.test(output);
    } catch (error) {
      console.error('Regex validation error:', error);
      return false;
    }
  }

  async validateWithContains(validation) {
    try {
      const output = await this.executeCommand(validation.command);
      return output.includes(validation.expectedOutput);
    } catch (error) {
      console.error('Contains validation error:', error);
      return false;
    }
  }

  async validateWithCustom(validation) {
    // Custom validation handlers for specific scenarios
    switch (validation.command) {
      case 'custom-check-lab1':
        return await this.checkLab1Completion();
      default:
        throw new Error('Unknown custom validation command');
    }
  }

  async executeCommand(command) {
    try {
      const exec = await this.docker.exec.create({
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true
      });

      const stream = await exec.start();
      return new Promise((resolve, reject) => {
        let output = '';
        stream.on('data', (chunk) => {
          output += chunk.toString();
        });
        stream.on('end', () => resolve(output));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Command execution error:', error);
      throw error;
    }
  }

  async checkLab1Completion() {
    try {
      // Check if hello-world image exists and was run
      const images = await this.docker.listImages();
      const containers = await this.docker.listContainers({ all: true });
      
      const hasImage = images.some(img => 
        img.RepoTags && img.RepoTags.includes('hello-world:latest')
      );
      
      const ranContainer = containers.some(container => 
        container.Image.includes('hello-world')
      );

      return hasImage && ranContainer;
    } catch (error) {
      console.error('Lab 1 completion check error:', error);
      return false;
    }
  }

  async getLabConfig(labId) {
    // In a real application, this would fetch from a database or API
    // For now, we're importing from our JSON configuration
    const labsConfig = require('./labs-config.json');
    return labsConfig.labs.find(lab => lab.id === labId);
  }
}

module.exports = new ValidationService();

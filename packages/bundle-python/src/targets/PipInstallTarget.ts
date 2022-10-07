import {GenericTarget} from '@genjs/genjs';

export class PipInstallTarget extends GenericTarget {
    buildSteps(options: any) {
        return [
            `python3 -m pip --disable-pip-version-check install ${options.target ? `--target ${options.target}` : ''} -r ${options.configFile || 'requirements.txt'}`,
        ];
    }
    buildDescription() {
        return 'Install the Python dependencies';
    }
}

export default PipInstallTarget
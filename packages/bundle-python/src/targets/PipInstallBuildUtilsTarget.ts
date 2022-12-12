import {GenericTarget} from '@genjs/genjs';

export class PipInstallBuildUtilsTarget extends GenericTarget {
    buildSteps(options: any) {
        return [
            `python3 -m pip install --upgrade pip`,
            `python3 -m pip install --upgrade setuptools wheel twine`,
        ];
    }
    buildDescription() {
        return 'Install Python build-utils';
    }
}

export default PipInstallBuildUtilsTarget
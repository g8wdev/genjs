import Package from './Package';
import {IGenerator, IPlugin} from '@genjs/genjs';
import registerTypescriptBundle from '@genjs/genjs-bundle-javascript';

export default class Plugin implements IPlugin {
    register(generator: IGenerator): void {
        registerTypescriptBundle(generator);
        generator.registerPackager('ts-react-native-app', cfg => new Package(cfg));
    }
}

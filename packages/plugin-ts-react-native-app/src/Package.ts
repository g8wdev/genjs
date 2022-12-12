import {TypescriptPackage} from '@genjs/genjs-bundle-typescript';
import {applyRefreshMakefileHelper} from "@genjs/genjs-bundle-package/lib/helpers/applyRefreshMakefileHelper";

export default class Package extends TypescriptPackage {
    constructor(config: any) {
        super(config, __dirname);
    }
    // noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
    protected buildDefaultVars(vars: any) {
        return {
            ...super.buildDefaultVars(vars),
            project_prefix: 'mycompany',
            project_name: 'myproject',
            dependencies: {
                "@expo/vector-icons": "^13.0.0",
                "@react-navigation/bottom-tabs": "^6.0.5",
                "@react-navigation/native": "^6.0.2",
                "@react-navigation/native-stack": "^6.1.0",
                "expo": "~47.0.8",
                "expo-asset": "~8.6.2",
                "expo-constants": "~14.0.2",
                "expo-font": "~11.0.1",
                "expo-linking": "~3.2.3",
                "expo-splash-screen": "~0.17.5",
                "expo-status-bar": "~1.4.2",
                "expo-system-ui": "~2.0.1",
                "expo-web-browser": "~12.0.0",
                "react": "18.1.0",
                "react-dom": "18.1.0",
                "react-native": "0.70.5",
                "react-native-safe-area-context": "4.4.1",
                "react-native-screens": "~3.18.0",
                "react-native-web": "~0.18.9"
            },
            devDependencies: {
                "@babel/core": "^7.12.9",
                "@types/react": "~18.0.24",
                "@types/react-native": "~0.70.6",
                "jest": "^26.6.3",
                "jest-expo": "~47.0.1",
                "react-test-renderer": "18.1.0",
                "typescript": "^4.6.3"
            },
        };
    }
   // noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
   protected buildFilesFromTemplates(vars: any, cfg: any) {
    return {
        ...super.buildFilesFromTemplates(vars, cfg),
        ['.eslintignore']: true,
        ['.eslintrc.js']: true,
        ['tsconfig.json']: true,
    };
}

protected buildGitIgnore(vars: any) {
    return super.buildGitIgnore(vars)
        .addComment('See https://help.github.com/articles/ignoring-files/ for more about ignoring files.')
        .addGroup('dependencies', [
            '/node_modules', '/.pnp', '.pnp.js',
        ])
        .addGroup('testing', [
            '/coverage',
        ])
        .addGroup('production', [
            '/build',
        ])
        .addGroup('misc', [
            '.DS_Store',
            '.env.local', '.env.development.local', '.env.test.local', '.env.production.local',
            'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*', '/dist'
        ])
    ;
}
protected buildMakefile(vars: any) {
    const t = super.buildMakefile(vars)
        .addGlobalVar('prefix', vars.project_prefix)
        .addGlobalVar('env', 'dev')
        .addGlobalVar('AWS_PROFILE', `${vars.aws_profile_prefix || '$(prefix)'}-$(env)`)
        .addGlobalVar('bucket_prefix', vars.bucket_prefix ? vars.bucket_prefix : `$(prefix)-${vars.project_name}`)
        .addGlobalVar('bucket', vars.bucket ? vars.bucket : `$(env)-$(bucket_prefix)-${vars.name}`)
        .addGlobalVar('cloudfront', vars.cloudfront ? vars.cloudfront : `$(AWS_CLOUDFRONT_DISTRIBUTION_ID_${vars.name.toUpperCase()})`)
        .addTarget('pre-install')
        .addPredefinedTarget('install', 'js-install')
        .addPredefinedTarget('build', 'js-build')
        .addPredefinedTarget('deploy-code', 'aws-s3-sync', {source: 'build/'})
        .addPredefinedTarget('invalidate-cache', 'aws-cloudfront-create-invalidation')
        .addMetaTarget('deploy', ['deploy-code', 'invalidate-cache'])
        .addPredefinedTarget('generate-env-local', 'generate-env-local', {prefix: 'STATICS', mode: vars.env_mode || 'terraform'})
        .addPredefinedTarget('start', 'js-start')
        .addPredefinedTarget('test', 'js-test', {ci: true, coverage: true})
        .addPredefinedTarget('test-dev', 'js-test', {local: true, all: true, coverage: false, color: true})
        .addPredefinedTarget('test-cov', 'js-test', {local: true})
        .addPredefinedTarget('test-ci', 'js-test', {ci: true})
    ;

    applyRefreshMakefileHelper(t, vars, this);

    return t;
}
    
      
}
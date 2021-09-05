import {
    GitIgnoreTemplate,
    LicenseTemplate,
    MakefileTemplate, NvmRcTemplate,
    ReadmeTemplate,
} from '@genjs/genjs';
import {MonorepoPackage} from '@genjs/genjs-bundle-monorepo';
import RootReadmeTemplate from "./RootReadmeTemplate";
import {buildProjectsVars} from "./utils";
import {applyScmMakefileHelper} from "@genjs/genjs-bundle-scm";

export default class Package extends MonorepoPackage {
    protected getTemplateRoot(): string {
        return `${__dirname}/../templates`;
    }
    // noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
    protected buildDefaultVars(vars: any): any {
        return {
            project_prefix: 'mycompany',
            project_name: 'myproject',
            projects: [],
            scm: 'git',
        };
    }
    // noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
    protected buildDynamicFiles(vars: any, cfg: any): any {
        return {
            ['LICENSE.md']: this.buildLicense(vars),
            ['.gitignore']: this.buildGitIgnore(vars),
            ['Makefile']: this.buildMakefile(vars),
            ['README.md']: this.buildReadme(vars),
            ...(vars.node_version ? {['.nvmrc']: new NvmRcTemplate(vars)} : {}),
        };
    }
    protected buildLicense(vars: any): LicenseTemplate {
        return new LicenseTemplate(vars);
    }
    protected buildReadme(vars: any): ReadmeTemplate {
        return new RootReadmeTemplate(vars);
    }
    protected buildGitIgnore(vars: any): GitIgnoreTemplate {
        return GitIgnoreTemplate.create(vars)
            .addGroup('Logs', [
                'logs', '*.log', 'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*',
            ])
            .addGroup('Runtime data', [
                'pids', '*.pid', '*.seed', '*.pid.lock',
            ])
            .addGroup('Directory for instrumented libs generated by jscoverage/JSCover', [
                'lib-cov',
            ])
            .addGroup('Coverage directory used by tools like istanbul', [
                'coverage',
            ])
            .addGroup('nyc test coverage', [
                '.nyc_output',
            ])
            .addGroup('Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-task-files)', [
                '.grunt',
            ])
            .addGroup('Bower dependency directory (https://bower.io/)', [
                'bower_components',
            ])
            .addGroup('node-waf configuration', [
                '.lock-wscript',
            ])
            .addGroup('Compiled binary addons (http://nodejs.org/api/addons.html)', [
                'build/Release',
            ])
            .addGroup('Dependency directories', [
                'node_modules/', 'jspm_packages/',
            ])
            .addGroup('Typescript v1 declaration files', [
                'typings/',
            ])
            .addGroup('Optional npm cache directory', [
                '.npm',
            ])
            .addGroup('Optional eslint cache', [
                '.eslintcache',
            ])
            .addGroup('Optional REPL history', [
                '.node_repl_history',
            ])
            .addGroup("Output of 'npm pack'", [
                '*.tgz',
            ])
            .addGroup('dotenv environment variable files', [
                '.env*',
            ])
            .addGroup('Mac files', [
                '.DS_Store',
            ])
            .addGroup('Yarn', [
                'yarn-error.log', '.pnp/', '.pnp.js',
            ])
            .addGroup('Yarn Integrity file', [
                '.yarn-integrity',
            ])
            .addGroup('IDE files', [
                '.idea/'
            ])
            .addGroup('Lambda Packages', [
                'package.zip',
            ])
        ;
    }
    protected buildMakefile(vars: any): MakefileTemplate {
        const {
            deployableProjects,
            migratableProjects,
            buildablePostProjects,
            buildablePreProjects,
            buildableProjects,
            generateEnvLocalableProjects,
            installableProjects,
            preInstallableProjects,
            refreshableProjects,
            startableProjects,
            testableProjects,
        } = buildProjectsVars(vars);
        const t = new MakefileTemplate({options: {npmClient: vars.npm_client}, predefinedTargets: this.predefinedTargets, relativeToRoot: this.relativeToRoot, makefile: false !== vars.makefile, ...(vars.makefile || {})})
            .addGlobalVar('env', 'dev')
            .addGlobalVar('b', vars.default_branch ? vars.default_branch : 'develop')
            .addPredefinedTarget('generate', 'js-genjs')
            .addPredefinedTarget('install-root', 'js-install')
            .addMetaTarget('pre-install-root', ['install-root'])
            .addMetaTarget('deploy', deployableProjects.map(p => `deploy-${p.name}`))
            .addMetaTarget('build', [...buildablePreProjects.map(p => `build-${p.name}`), ...buildablePostProjects.map(p => `build-${p.name}`)])
            .addMetaTarget('test', testableProjects.map(p => `test-${p.name}`))
            .addMetaTarget('pre-install', ['pre-install-root', ...preInstallableProjects.map(p => `pre-install-${p.name}`)])
            .addMetaTarget('install', ['install-root', ...installableProjects.map(p => `install-${p.name}`)])
            .addTarget('start', [vars.startCmd || `npx concurrently -n ${startableProjects.map(p => p.name)} ${startableProjects.map(p => `"make start-${p.name}"`).join(' ')}`])
            .setDefaultTarget('install')
            .addExportedVar('CI')
        ;
        this.hasFeature('github_vars') && t.addExportedVars([
            'GITHUB_WORKFLOW', 'GITHUB_RUN_ID', 'GITHUB_RUN_NUMBER', 'GITHUB_ACTION', 'GITHUB_ACTIONS',
            'GITHUB_ACTOR', 'GITHUB_REPOSITORY', 'GITHUB_EVENT_NAME', 'GITHUB_EVENT_PATH', 'GITHUB_WORKSPACE',
            'GITHUB_SHA', 'GITHUB_REF', 'GITHUB_HEAD_REF', 'GITHUB_BASE_REF', 'GITHUB_SERVER_URL', 'GITHUB_API_URL',
            'GITHUB_GRAPHQL_URL',
        ]);
        this.hasFeature('aws_cli_vars') && t.addExportedVars([
            'AWS_ACCESS_KEY_ID', 'AWS_CA_BUNDLE', 'AWS_CLI_AUTO_PROMPT', 'AWS_CLI_FILE_ENCODING', 'AWS_CONFIG_FILE',
            'AWS_DEFAULT_OUTPUT', 'AWS_DEFAULT_REGION', 'AWS_EC2_METADATA_DISABLED', 'AWS_MAX_ATTEMPTS', 'AWS_PAGER',
            'AWS_RETRY_MODE', 'AWS_ROLE_SESSION_NAME', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_SHARED_CREDENTIALS_FILE',
            'AWS_STS_REGIONAL_ENDPOINTS',
        ]);
        this.hasFeature('linux_vars') && t.addExportedVars([
            'USER', 'SHELL', 'HOSTNAME', 'HOME', 'LANG', 'TZ', 'TERM', 'EDITOR', 'OSTYPE', 'MACHTYPE',
        ]);
        if (0 < migratableProjects.length) {
            t.addMetaTarget('migrate', [...migratableProjects.map(p => `migrate-${p.name}`)]);
        } else {
            t.addNoopTarget('migrate');
        }
        [...Object.keys(vars.project_envs || {}), ...(!!vars.env_local ? ['local'] : [])].forEach(env => {
            t.addTarget(`switch-${env}`, generateEnvLocalableProjects.map(p => `make -C . generate-env-local-${p.name} env=${env}`))
        });
        preInstallableProjects.forEach(p => {
            t.addSubTarget(`pre-install-${p.name}`, p.fullDir, 'pre-install');
        });
        installableProjects.forEach(p => {
            t.addSubTarget(`install-${p.name}`, p.fullDir, 'install');
        });
        testableProjects.forEach(p => {
            t.addSubTarget(`test-${p.name}`, p.fullDir, 'test');
        });
        generateEnvLocalableProjects.forEach(p => {
            t.addSubTarget(`generate-env-local-${p.name}`, p.fullDir, 'generate-env-local', {env: '$(env)'});
        });
        buildableProjects.forEach(p => {
            t.addSubTarget(`build-${p.name}`, p.fullDir, 'build', {env: '$(env)'}, generateEnvLocalableProjects.find(x => p.name === x.name) ? [`generate-env-local-${p.name}`] : []);
        });
        deployableProjects.forEach(p => {
            !!p.deployable && t.addSubTarget(`deploy-${p.name}`, p.fullDir, 'deploy', {env: '$(env)'}, generateEnvLocalableProjects.find(x => p.name === x.name) ? [`generate-env-local-${p.name}`] : [], {sourceEnvLocal: true});
        });
        migratableProjects.forEach(p => {
            !!p.migratable && t.addSubTarget(`migrate-${p.name}`, p.fullDir, 'migrate', {env: '$(env)'}, generateEnvLocalableProjects.find(x => p.name === x.name) ? [`generate-env-local-${p.name}`] : [], {sourceEnvLocal: true});
        });
        refreshableProjects.forEach(p => {
            !!p.refreshable && t.addSubTarget(`refresh-${p.name}`, p.fullDir, 'refresh', {env: '$(env)'}, generateEnvLocalableProjects.find(x => p.name === x.name) ? [`generate-env-local-${p.name}`] : [], {sourceEnvLocal: true});
        });
        startableProjects.forEach(p => {
            !!p.startable && t.addSubTarget(`start-${p.name}`, p.fullDir, 'start', {env: '$(env)'});
        });

        applyScmMakefileHelper(t, vars, this);

        return t;
    }
    protected getTechnologies(): any {
        return [
            'genjs',
            'make',
            'aws_cli',
            'aws_profiles',
            'aws_iam',
            'aws_organizations',
            'aws_console',
            'aws_cloudwatch',
            'node',
            'es6',
            'yarn',
            'nvm',
            'npm',
            'markdown',
            'git',
            'jest',
            'prettier',
            'json',
            ...((this.vars.scm === 'github') ? ['github', 'github_actions', 'github_packages', 'npm_rc_github', 'hub', 'ssh_github'] : []),
            (this.vars.scm === 'gitlab') && 'gitlab',
        ];
    }
}
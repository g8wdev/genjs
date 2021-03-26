import {
    AbstractPackage,
    GitIgnoreTemplate,
    LicenseTemplate,
    MakefileTemplate,
    ReadmeTemplate,
    TerraformToVarsTemplate,
} from '@genjs/genjs';
import RootReadmeTemplate from "./RootReadmeTemplate";
import {buildProjectEnvsVars, buildProjectsVars} from "./utils";

export default class Package extends AbstractPackage {
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
            ['terraform-to-vars.json']: this.buildTerraformToVars(vars),
            ['README.md']: this.buildReadme(vars),
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
            .addGroup('Terraform', [
                '.terraform/', '*.tfplan', '/outputs/', '*.zip'
            ])
        ;
    }
    protected buildMakefile(vars: any): MakefileTemplate {
        const scm = vars.scm || 'git';
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
        const {sortedProjectEnvs} = buildProjectEnvsVars(vars);
        const t = new MakefileTemplate({relativeToRoot: this.relativeToRoot, makefile: false !== vars.makefile, ...(vars.makefile || {})})
            .addGlobalVar('env', 'dev')
            .addGlobalVar('b', vars.default_branch ? vars.default_branch : 'develop')
            .addPredefinedTarget('generate', 'yarn-genjs')
            .addPredefinedTarget('install-root', 'yarn-install')
            .addPredefinedTarget('install-terraform', 'tfenv-install')
            .addMetaTarget('pre-install-root', ['install-root'])
            .addMetaTarget('deploy', deployableProjects.map(p => `deploy-${p.name}`))
            .addMetaTarget('build', ['build-pre-provision', 'build-post-provision'])
            .addMetaTarget('build-pre-plan', buildablePreProjects.map(p => `build-${p.name}`))
            .addMetaTarget('build-pre-provision', ['build-pre-plan'])
            .addMetaTarget('build-post-provision', buildablePostProjects.map(p => `build-${p.name}`))
            .addMetaTarget('test', testableProjects.map(p => `test-${p.name}`))
            .addSubTarget('provision', 'infra', 'provision', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('provision-full', 'infra', 'provision-full', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-init', 'infra', 'init', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-plan', 'infra', 'plan', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-apply', 'infra', 'apply', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-refresh', 'infra', 'refresh', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-update', 'infra', 'update', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-lock-providers', 'infra', 'lock-providers', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-list-layers', 'infra', 'list-layers', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-init-full', 'infra', 'init-full', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-init-full-upgrade', 'infra', 'init-full-upgrade', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-destroy', 'infra', 'destroy', {env: '$(env)', layer: '$(layer)'}, ['generate-terraform'])
            .addSubTarget('output', 'infra', 'output', {env: '$(env)', layer: '$(layer)'}, ['generate-terraform'])
            .addSubTarget('output-json', 'infra', 'output-json', {env: '$(env)', layer: '$(layer)'}, ['generate-terraform'])
            .addSubTarget('outputs', 'infra', 'outputs', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('infra-init-upgrade', 'infra', 'init-upgrade', {env: '$(env)'}, ['generate-terraform'])
            .addSubTarget('generate-terraform', 'infra', 'generate')
            .addMetaTarget('generate-env-local', generateEnvLocalableProjects.map(p => `generate-env-local-${p.name}`))
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
        if (this.hasFeature('terraform_shared_cache')) {
            t.addExportedVar('TF_PLUGIN_CACHE_DIR', '$(shell pwd)/.terraform/caches/plugins');
            t.addSubTarget('generate-terraform-code', 'infra', 'generate')
            t.addTarget('ensure-terraform-cache-dir', ['mkdir -p $(TF_PLUGIN_CACHE_DIR)']);
            t.addMetaTarget('generate-terraform', ['ensure-terraform-cache-dir', 'generate-terraform-code']);
        }
        this.hasFeature('terraform_vars') && t.addExportedVars([
            'TF_LOG', 'TF_LOG_PATH', 'TF_INPUT', 'TF_CLI_ARGS', 'TF_DATA_DIR', 'TF_WORKSPACE', 'TF_IN_AUTOMATION',
            'TF_REGISTRY_DISCOVERY_RETRY', 'TF_REGISTRY_CLIENT_TIMEOUT', 'TF_CLI_CONFIG_FILE', 'TF_IGNORE',
        ]);
        if (0 < migratableProjects.length) {
            t.addMetaTarget('migrate', [...migratableProjects.map(p => `migrate-${p.name}`)]);
        } else {
            t.addNoopTarget('migrate');
        }
        t.addTarget('infra-layer-plugins-upgrade', [
            `echo "Cleaning Terraform plugins directory: $(layer)"`,
            ...sortedProjectEnvs.map(e => `rm -rf infra/environments/${e.id}/$(layer)/.terraform/(plugins|providers)`),
            `echo "Fetching Terraform plugins: $(layer)"`,
            ...sortedProjectEnvs.map(e => `make infra-init-upgrade layer=$(layer) env=${e.id}`),
            `echo "Initializing: $(layer)"`,
            ...sortedProjectEnvs.map(e => `make infra-init layer=$(layer) env=${e.id}`),
        ]);
        Object.keys(vars.project_envs || {}).forEach(env => {
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
            !!p.refreshable && t.addSubTarget(`refresh-${p.name}`, 'infra', 'provision', {env: '$(env)', layer: p.name}, ['generate-terraform', `build-${p.name}`]);
        });
        startableProjects.forEach(p => {
            !!p.startable && t.addSubTarget(`start-${p.name}`, p.fullDir, 'start', {env: '$(env)'});
        });
        ('github' === scm) && t.addTarget('pr', ['hub pull-request -b $(b)']);
        return t;
    }
    protected buildTerraformToVars(vars: any): TerraformToVarsTemplate {
        return new TerraformToVarsTemplate(vars);
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
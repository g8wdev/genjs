module.exports = {
    plugins: [
        '@ts-react-native-app',
    ],
    vars: {
        author: {
            name: 'Olivier Hoareau',
            email: 'oss@genjs.dev',
        },
    },
    packages: {
        app: {
            type: 'ts-react-native-app',
            vars: {
                readme: true,
                project_prefix: 'myothercompany',
                project_name: 'someproject',
                name: 'app',
                envs_from_terraform: {
                    aws_cloudfront_distribution_id_admin: "@websites-admin:cloudfront_id",
                    react_app_api_core_endpoint: "@apis-core:endpoint"
                }
            },
        }
    }
};
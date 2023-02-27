const { Command } = require('commander');
const program = new Command();

const k8s = require('@kubernetes/client-node');

program
  .name('ck8s')
  .description('CK8S CLI')
  .version('0.1.0');

program.command('init')
  .description('Initialize the config path')
  // .argument('<string>', 'string to split')
  .option('--generate-new-secret', 'Generate a new secret', true)
  .action((str, options) => {
    console.log(`Initializing the config path ..`);
  });

program.command('bootstrap')
  .description('Bootstrap the cluster')
  .argument('[cluster]', 'Target cluster (sc | wc)', "sc")
  .action((cluster) => {
    console.log(`Bootstraping ${cluster} cluster ..`);
  });

program.command('apps')
  .description('Deploy the applications')
  .argument('[cluster]', 'Target cluster (sc | wc)', "sc")
  .option('--sync', 'Synchronize', false)
  .option('--skip-template-validate', 'Skip template validation', false)
  .action((cluster, options) => {
    console.log(`Deploy apps to ${cluster} cluster`);
  });

program.command('test')
  .description('Test the applications')
  .argument('[cluster]', 'Target cluster (sc | wc)', "sc")
  .argument('[component]', 'Target component : base | ingress | opensearch', "base")
  .option('--health', 'Check ingress health', false)
  .action((cluster, component, options) => {
    console.log(`Running ${component} tests against ${cluster} cluster`);
    if (component == 'ingress') {

      if (options.health) {
        console.log("Checking ingress health ...")
        const kc = new k8s.KubeConfig();
        kc.loadFromFile(`${process.env.CK8S_CONFIG_PATH}/.state/kube_config_${cluster}.yaml`)
        
        const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
        k8sApi.readNamespacedDaemonSetStatus("ingress-nginx-controller", "ingress-nginx").then((res) => {
          if (res.body.status.numberReady != res.body.status.currentNumberScheduled)  {
            console.log('[ERROR] Some ingress-nginx pods are not ready')
          } else {
            console.log('[SUCCESS] All nginx pods are ready')
          }
        })
      }
      }
  });



program.parse();
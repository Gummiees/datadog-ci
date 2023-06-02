import {LambdaFlareCommand} from '../flare'

import {dryRunTag} from './common-renderer'

/**
 * @returns a header indicating which `lambda` subcommand is running.
 * @param command current selected lambda subcommand.
 *
 * ```txt
 * [Dry Run] 🐶 Instrumenting Lambda function
 * ```
 */
export const renderLambdaFlareHeader = (isDryRun: boolean) => {
  const prefix = isDryRun ? `${dryRunTag} ` : ''

  return `\n${prefix}🐶 Generating Lambda flare to send your configuration to Datadog\n`
}

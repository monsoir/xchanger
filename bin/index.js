const program = require('commander');
const request = require('request');
const Spinner = require('cli-spinner').Spinner;
const chalk = require('chalk');

const URL = 'http://api.fixer.io';
const log = console.log;
const spinner = new Spinner('Loading...');
spinner.setSpinnerString('|/-\\');

function animateSpinner(animated) {
    animated ? spinner.start() : spinner.stop(true);
}

program.version('1.0.0');

program.command('show')
       .description('show rates based on -b option value')
       .option('-a, --all [all]', 'should show all avaliable rates?', false)
       .option('-b, --base [base]', 'based on [base], all rates will be shown, the default is CNY', 'CNY')
       .option('-s, --symbol [symbol]', 'based on [base], rate(s) of [symbol] will be shown, the default is USD', 'USD')
       .action(function(options) {
            let url = '/latest?'
            if (options.base) {
                if (options.symbol && !options.all) {
                    url = url + `base=${options.base.toUpperCase()}` + `&symbols=${options.symbol.toUpperCase()}`;
                } else {
                    url = url + `base=${options.base.toUpperCase()}`; 
                }
            } else {
                log(chalk.red('Arguments error!'));
                return;
            }

            const finalURL = `${URL}${url}`;
            animateSpinner(true);
            request(
                `${URL}${url}`,
                function(err, response, body) {

                    if (err) {
                        log(chalk.red(err));
                        return;
                    }

                    const content = JSON.parse(body);
                    const rates = content.rates;
                    const results = Object.keys(rates).map((value) => {
                        return `${value}: ${rates[value]}`;
                    });
                    animateSpinner(false);
                    log(chalk.yellow('Powered by: Fixer.io'));
                    log(chalk.magenta(`${content['base']}: 1`));
                    results.forEach(function(element, index) {
                        if (index % 2 === 0) {
                            log(chalk.white.bgGreen(element));
                        } else {
                            log(chalk.white.bgBlue(element));
                        }
                    });
                }
            );
        })
        .on('--help', function(){
            log('    \nExample:');
            log();
            log('        $ show -a');
            log('        $ show -b CNY -s USD');
            log();
        })
        ;


program.command('convert')
       .description('convert a value')
       .option('-v, --value <value>', 'value to be converted, the default is 1', 1)
       .option('-b, --base [base]', 'based on <based>, corresponding value of <symbol> will be calculated with rate, the default is CNY', 'CNY')
       .option('-s, --symbol [symbol]', 'target symbol, the default is USD', 'USD')
       .action(function(options) {
           if (isNaN(options.value) || typeof options.base !== 'string' || typeof options.symbol !== 'string') {
               log(chalk.red('Arguments error!'));
               return;
           }

           const base = options.base.toUpperCase();
           const symbol = options.symbol.toUpperCase();
           if (base === symbol) {
               log(chalk.white.bgGreen('same symbol ???'));
               return;
           }

           const url = `${URL}/latest?base=${base}&symbols=${symbol}`;
           animateSpinner(true);
           request(
               url,
               (err, response, body) => {
                   animateSpinner(false);
                   if (err) {
                       log(chalk.red(err));
                       return;
                   }

                   const content = JSON.parse(body);
                   if (content && content.rates && content.rates[symbol]) {
                       const rate = content.rates[symbol];
                       const result = options.value * rate;
                       log(chalk.yellow('Powered by: Fixer.io'));
                       log(chalk.white.bgMagenta(`${base}: ${options.value}`));
                       log(chalk.white.bgCyan(`${symbol}: ${result}`));
                   } 
               },
           );
       })
       .on('--help', function() {
           log('    \nExample');
           log();
           log('        $ convert -v 12');
           log('        $ convert -v 12 -b CNY -s USD');
           log();
       })
       ;

program.parse(process.argv);

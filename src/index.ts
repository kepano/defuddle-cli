#!/usr/bin/env node

import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';
import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

interface ParseOptions {
	output?: string;
	markdown?: boolean;
	md?: boolean;
	json?: boolean;
	debug?: boolean;
	property?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
	.name('defuddle')
	.description('Extract article content from web pages')
	.version('0.1.0');

program
	.command('parse')
	.description('Parse HTML content from a file or URL')
	.argument('<source>', 'HTML file path or URL to parse')
	.option('-o, --output <file>', 'Output file path (default: stdout)')
	.option('-m, --markdown', 'Convert content to markdown format')
	.option('--md', 'Alias for --markdown')
	.option('-j, --json', 'Output as JSON with metadata and content')
	.option('-p, --property <name>', 'Extract a specific property (e.g., title, description, domain)')
	.option('--debug', 'Enable debug mode')
	.action(async (source: string, options: ParseOptions) => {
		try {
			// Handle --md alias
			if (options.md) {
				options.markdown = true;
			}
			let dom: JSDOM;

			try {
				// Determine if source is a URL or file path
				if (source.startsWith('http://') || source.startsWith('https://')) {
					dom = await JSDOM.fromURL(source);
				} else {
					const filePath = resolve(process.cwd(), source);
					dom = await JSDOM.fromFile(filePath);
				}

				// Parse content with debug mode if enabled
				try {
					const result = await Defuddle(dom, source.startsWith('http') ? source : undefined, {
						debug: options.debug,
						markdown: options.markdown
					});

					// If in debug mode, don't show content output
					if (options.debug) {
						process.exit(0);
					}

					// Format output
					let output: string;

					// Format the response based on options
					if (options.property) {
						// Extract specific property
						const property = options.property.toLowerCase();
						if (property in result) {
							output = result[property as keyof typeof result]?.toString() || '';
						} else {
							console.error(chalk.red(`Error: Property "${property}" not found in response`));
							process.exit(1);
						}
					} else if (options.json) {
						const jsonObj: any = { 
							content: result.content,
							title: result.title,
							description: result.description,
							domain: result.domain,
							favicon: result.favicon,
							image: result.image,
							metaTags: result.metaTags,
							parseTime: result.parseTime,
							published: result.published,
							author: result.author,
							site: result.site,
							schemaOrgData: result.schemaOrgData,
							wordCount: result.wordCount
						};

						output = JSON.stringify(jsonObj, null, 2)
							.replace(/"([^"]+)":/g, chalk.cyan('"$1":'))
							.replace(/: "([^"]+)"/g, chalk.yellow(': "$1"'))
							.replace(/: (\d+)/g, chalk.yellow(': $1'))
							.replace(/: (true|false|null)/g, chalk.magenta(': $1'));
					} else {
						output = result.content;
					}

					// Handle output
					if (options.output) {
						const outputPath = resolve(process.cwd(), options.output);
						await writeFile(outputPath, output, 'utf-8');
						console.log(chalk.green(`Output written to ${options.output}`));
					} else {
						console.log(output);
					}
					
					process.exit(0);
				} catch (error) {
					console.error(chalk.red('Error during parsing:'), error);
					process.exit(1);
				}
			} catch (error) {
				console.error(chalk.red('Error loading content:'), error instanceof Error ? error.message : 'Unknown error occurred');
				process.exit(1);
			}

		} catch (error) {
			console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
			process.exit(1);
		}
	});

program.parse(); 
# Grafana Hive Selector App Plugin

A Grafana App Plugin that adds a nested Hive selector dropdown to the dashboard control bar, allowing users to easily navigate and select from hierarchical hive groups, sub-groups, and nodes.

## Features

- **Nested Tree Structure**: Browse and select from hierarchical hive groups, sub-groups, and leaf nodes
- **Search Functionality**: Search across all groups, sub-groups, and nodes with intelligent prioritization
- **Control Bar Integration**: Seamlessly integrated into Grafana's dashboard control bar
- **Auto-injection**: Automatically appears on dashboard pages after login

## Installation

### Using grafana-cli

```bash
grafana-cli plugins install ravinderblockchain-hiveselector-app
```

### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/ravinderblockchian/grafana-hive-selector-app/releases)
2. Extract the ZIP file to your Grafana plugins directory:
   ```bash
   unzip ravinderblockchain-hiveselector-app-*.zip -d /var/lib/grafana/plugins/
   ```
3. Restart Grafana:
   ```bash
   sudo systemctl restart grafana-server
   ```

## Usage

After installation, the Hive selector dropdown will automatically appear in the control bar on all dashboard pages. Simply:

1. Click on the dropdown to see the nested tree structure
2. Navigate through groups and sub-groups
3. Use the search bar to quickly find specific items
4. Select a node to filter your dashboard data

## Configuration

The plugin automatically injects into the Grafana dashboard control bar. No additional configuration is required.

## Requirements

- Grafana >= 10.4.0
- Node.js >= 22 (for development)

## Development

### Build

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm run test
```

## License

Apache-2.0

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/ravinderblockchian/grafana-hive-selector-app).

## Author

ravinderblockchain


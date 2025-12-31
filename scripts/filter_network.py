#!/usr/bin/env python3
import json

# Load network data
with open('scripts/network_data.json', 'r') as f:
    data = json.load(f)

# Reference nodes to find minimum x
ref_nodes = ['3339821648', '250691723', '250691724', '250698924', '250698925', 
             '250698926', '250699982', '250699983', '250702474', '250700248']

# Find minimum x-coordinate
ref_x_coords = [n['x'] for n in data['nodes'] if n['id'] in ref_nodes]
min_x = min(ref_x_coords)
print(f'Minimum x-coordinate: {min_x}')

# Filter nodes: keep only those with x >= min_x
nodes_to_keep = [n for n in data['nodes'] if n['x'] >= min_x]
node_ids_to_keep = {n['id'] for n in nodes_to_keep}

# Filter edges: keep only those where both from and to nodes are kept
edges_to_keep = [e for e in data['edges'] 
                 if e['from'] in node_ids_to_keep and e['to'] in node_ids_to_keep]

print(f'Original: {len(data["nodes"])} nodes, {len(data["edges"])} edges')
print(f'Filtered: {len(nodes_to_keep)} nodes, {len(edges_to_keep)} edges')

# Save filtered data
filtered_data = {
    'nodes': nodes_to_keep,
    'edges': edges_to_keep
}

with open('scripts/network_data.json', 'w') as f:
    json.dump(filtered_data, f, indent=2)

print('Filtered network saved to scripts/network_data.json')



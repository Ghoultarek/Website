#!/usr/bin/env python3
"""
Script to fetch OSM road network and convert to node-link format for routing demo.
"""

import osmnx as ox
import networkx as nx
import json
import random

# Define the bounding box (Athens, Greece area)
bbox = [
    37.97636572397411,  # min_lat
    23.729946182088714,  # min_lon
    37.98530275447799,  # max_lat
    23.741572180231984   # max_lon
]

print("Fetching OSM network data...")
# Fetch the road network
G = ox.graph_from_bbox(
    bbox[2], bbox[0], bbox[3], bbox[1],
    network_type='drive',
    simplify=True
)

print(f"Network has {len(G.nodes)} nodes and {len(G.edges)} edges")

# Convert to node-link format
nodes = []
edges = []

# Get node positions and create nodes
node_positions = {}
for node_id, data in G.nodes(data=True):
    x = data.get('x', 0)
    y = data.get('y', 0)
    # Normalize coordinates to fit in SVG viewBox (0-800, 0-600)
    # We'll scale and translate to fit nicely
    node_positions[node_id] = (x, y)

# Find min/max for normalization
if node_positions:
    all_x = [pos[0] for pos in node_positions.values()]
    all_y = [pos[1] for pos in node_positions.values()]
    min_x, max_x = min(all_x), max(all_x)
    min_y, max_y = min(all_y), max(all_y)
    
    # Add padding
    padding = 0.1
    x_range = max_x - min_x
    y_range = max_y - min_y
    min_x -= x_range * padding
    max_x += x_range * padding
    min_y -= y_range * padding
    max_y += y_range * padding
    
    x_range = max_x - min_x
    y_range = max_y - min_y
    
    # Scale to fit in 800x600 viewBox with some margin
    svg_width = 750
    svg_height = 550
    margin = 25
    
    scale_x = (svg_width - 2 * margin) / x_range if x_range > 0 else 1
    scale_y = (svg_height - 2 * margin) / y_range if y_range > 0 else 1
    scale = min(scale_x, scale_y)  # Maintain aspect ratio
    
    # Create nodes with normalized coordinates
    node_id_map = {}
    for idx, (node_id, (x, y)) in enumerate(node_positions.items()):
        normalized_x = margin + (x - min_x) * scale
        normalized_y = margin + (y - min_y) * scale
        
        # Use a simple label (A, B, C, ... then AA, AB, etc.)
        if idx < 26:
            label = chr(65 + idx)  # A-Z
        else:
            label = chr(65 + (idx // 26 - 1)) + chr(65 + (idx % 26))
        
        nodes.append({
            'id': str(node_id),
            'x': round(normalized_x, 2),
            'y': round(normalized_y, 2),
            'label': label
        })
        node_id_map[node_id] = str(node_id)
    
    # Create edges with random weights
    for u, v, data in G.edges(data=True):
        if u in node_id_map and v in node_id_map:
            # Generate random weight between 1 and 20
            weight = round(random.uniform(1, 20), 1)
            edges.append({
                'from': node_id_map[u],
                'to': node_id_map[v],
                'weight': weight
            })

print(f"Created {len(nodes)} nodes and {len(edges)} edges")

# Save to JSON file
output = {
    'nodes': nodes,
    'edges': edges
}

output_file = 'scripts/network_data.json'
with open(output_file, 'w') as f:
    json.dump(output, f, indent=2)

print(f"Network data saved to {output_file}")
print(f"Node count: {len(nodes)}")
print(f"Edge count: {len(edges)}")



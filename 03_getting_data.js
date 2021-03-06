'use strict';

let api_version = 24;

let root_url = location.protocol + '//' + location.hostname + (location.port ? ':'+location.port: '') + '/';

let fdg_type = 'd3';

    let create_fdg = function(flat, link_name="links") {
		var nodes = [], links = [], nd = {}, lk = {}, node_lut = {}, current_node, current_node_pos;//, levels = []
				
		var create_fdg_element = function(d, i) {
			Object.keys(d).forEach(function (r) {
				nd[r] = d[r];
			});
			if ((d.parent != "") && (d.parent != null))  {
				lk = {"source": d.parent, "target": d.id, "value": 1};
				links.push(lk);
				lk = {};
				nd.level = null;// insert entry for level - update in phase 2
			} else {
				nd.level = 0;
				// assume there is only one root, otherwise would need to push
				current_node = d.id;
				current_node_pos = i;
			}

			nodes.push(nd);
			nd = {};

			node_lut[d.id] = i;
		}
		
		// use presence of 'push' function to determine if an Array or Object
		if (typeof(flat.push) == 'function') {
			// Array
			flat.forEach(function(d, i) {
				create_fdg_element(d, i);
			});
		} else {
			// Object
			Object.keys(flat).forEach(function (d, i) {
				create_fdg_element(flat[d], i);
			});
		}
		
		
		// This section works out the level of each node ////////////////////////////////

		function calculate_levels(top_nodes, remaining_nodes, curr_level, curr_node, curr_node_pos) {
			var next_nodes = [], lower_nodes = [], next_node_id, this_level;
			var parent_id = node_lut[top_nodes[curr_node_pos].parent];

			if (typeof(parent_id) != 'undefined') {
				this_level = top_nodes[parent_id].level + 1;
			} else {
				this_level = 0;
			}
			
			top_nodes[curr_node_pos].level = this_level;

			remaining_nodes.forEach(function(n) {
				if (top_nodes[n].parent == curr_node) {
					next_nodes.push(n);
				} else {
					lower_nodes.push(n);
				}
			});

			next_nodes.forEach(function() {
				curr_node_pos = remaining_nodes.splice(0, 1);
				next_node_id = top_nodes[curr_node_pos[0]].id;
				calculate_levels(top_nodes, remaining_nodes, this_level, next_node_id, curr_node_pos[0]);
			});
		}
		
		//construct array of node-ids, other than that of the root node, to search
		// do this by creating all ids for nodes array, then removing the root id
		var node_ids = [];
		for (var i = 0; i < nodes.length; i++) {
			node_ids.push(i);
		}
		node_ids.splice(current_node_pos, 1);
		calculate_levels(nodes, node_ids, 0, current_node, current_node_pos);////////
        
        // configure the links/edges name correctly depending on what the package wants to call it
        let out = {"nodes": nodes};
        out[link_name] = links;
        return out;
	}


let draw_ogma_tree = function(ogma, tree_data) {
    let fdg_tree = create_fdg(tree_data, "edges");
    let tree_style = 'forceLink';
    console.log('fdg_tree, ' + fdg_type, fdg_tree);
    
    ogma.styles.addNodeRule({
      text: {
        position: 'right', // 'left', 'top', 'right', 'bottom', 'center'
        maxLineLength: 240, // truncate
        size: 12,
        color: 'black',
        threshold: 5,
        content: function (n) { return n.getId(); }
      }
    });
    
    ogma.setGraph(fdg_tree);

     // Run layout
    if (tree_style == 'hierarchical') {
        ogma.layouts.hierarchical({
            directed: true,     // Take edge direction into account
            rankdir: 'LR',      // Direction for rank nodes. Can be TB, BT, LR, or RL,
                                // where T = top, B = bottom, L = left, and R = right.
            duration: 300,      // Duration of the animation
            nodeDistance:  10,  // Number of pixels that separate nodes horizontally in the layout.
            levelDistance: 300   // Number of pixels between each rank in the layout.
        })
        .then(function() {
            console.log('done');
            ogma.view.locateGraph({
                easing: 'linear',
                duration: 300
            });
        });
    } else if (tree_style == 'forceLink') {
        ogma.layouts.forceLink({
            barnesHutOptimize: false,
            duration: 500
        })
        .then(function() {
            ogma.view.locateGraph({
                easing: 'linear',
                duration: 300
            });
        });
    }
}


// note that this doesn't use the standard d3 fdg, but a modified one (supposed to be faster)
// see: https://bl.ocks.org/rpgove/98820c49a3d7fd0d4d628402536aa60b
//      https://github.com/twosixlabs/d3-force-reuse
//      https://www.twosixlabs.com/faster-force-directed-graph-layouts-by-reusing-force-approximations/

let draw_d3_tree = function(d3_elem, tree_data, str = -50, d_min = 10, d_max = 300) {
    let graph = create_fdg(tree_data, "links");

    let width = 1000, height = 1000;
        
    var svg = d3.select("#" + d3_elem)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBodyReuse().strength(str).distanceMin(d_min).distanceMax(d_max))
        .force("center", d3.forceCenter(width / 2, height / 2));

      var link = svg.append("g")
          .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
          .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.append("g")
          .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function(d) { 
            if(typeof(d.colour) != 'undefined') return d.colour;
            else return color(d.status); })
          .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

      node.append("title")
          .text(function(d) { return d.id; });

      simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(graph.links);

    var txt_x = 7, txt_y = 2;
    var texts = svg.selectAll("text.label")
                .data(graph.nodes)
                .enter().append("text")
                .attr("class", "label")
                .attr("fill", "darkgrey")
                .attr("x", txt_x)
                .attr("y", txt_y)
                .text(function(d) {  return d.name;  });


      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        
        texts.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
      }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }


}


switch (fdg_type) {
    case 'ogma':
        let ogma1 = new Ogma({container: 'graph-container1'});
        let ogma2 = new Ogma({container: 'graph-container2'});

        let get_and_draw_ogma_tree = function(url, og, elem) {
            axios.get(url)
                .then(function (tree) {
                    draw_ogma_tree(og, tree.data);
                    document.getElementById(elem).value = JSON.stringify(tree.data, null, 4);
                });
        }
        
        get_and_draw_ogma_tree(root_url + 'energy/dukes_flow/tree', ogma1, 'flowtext');
        get_and_draw_ogma_tree(root_url + 'energy/dukes_fuel/tree', ogma2, 'fueltext');
//         get_and_draw_ogma_tree('http://localhost:8080/energy/dukes_flow/tree', ogma1, 'flowtext');
//         get_and_draw_ogma_tree('http://localhost:8080/energy/dukes_fuel/tree', ogma2, 'fueltext');
    
    break;
    
    // see https://d3indepth.com/force-layout/ for useful explanation of fdg parameters
    case 'd3':
        let get_and_draw_d3_tree = function(url, d3_elem, elem, str = -50, d_min = 10, d_max = 300) {
            axios.get(url)
                .then(function (tree) {
                    draw_d3_tree(d3_elem, tree.data, str, d_min, d_max);
                    document.getElementById(elem).value = JSON.stringify(tree.data, null, 4);
                });
        }
        
        get_and_draw_d3_tree(root_url + 'energy/dukes_flow/tree', 'graph-container1', 'flowtext', -100, 50, 600);
        get_and_draw_d3_tree(root_url + 'energy/dukes_fuel/tree', 'graph-container2', 'fueltext', -150, 75, 600);
    
    break;
    
    
    default:
        console.log('not drawing tree today');
    break;
}



// This queries API for info on the tables in use, their dimensions, and descriptions if they exist
let make_table_list = function(raw) {
    let output = '';
    
    for (var key in raw) {
        if (raw.hasOwnProperty(key)) {
            output += ("<h4>" + key + "</h4><ul>");
            console.log('raw[key]', key, raw[key]);
            for (let key2 in raw[key]) {
                console.log('key2', key2);
                if (raw[key][key2].title != '') output += ("<h5>" + raw[key][key2].title + "</h5>");
                if (raw[key][key2].description != '') output += ("<p>" + raw[key][key2].description + "</p>");
                output += ('<p><kbd class="route">' + raw[key][key2].table_name.replace('_', '/')  + '</kbd>');
                if (typeof(raw[key][key2].dimensions) != 'undefined') output += " [" + raw[key][key2].dimensions.join(", ") + "]</p>";
            }
            output += "</ul>";
        }
    }
    return output;
}

// This is a new feature not available yet on the public/CBAS version
if (api_version > 27) {
    axios.get(root_url, {headers: {'accept': 'application/hal+json', 'X-Request-ID': '100'}})
        .then(function (res) {
        console.log(JSON.stringify(res.data));
            document.getElementById('database_tables').innerHTML = make_table_list(res.data);
        });
}

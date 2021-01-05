
var yr_start = 1998, yr_end = 2017;
var base_data_url = location.protocol + '//' + location.hostname + (location.port ? ':'+location.port: '') + '/';
var graph_specs = [];


var vopt = {
    "mode": "vega-lite",
    "renderer" : "svg",
    "actions" : false,
    "config"	: {autosize: 'pad'}
};

// some colour palettes
// vega.scheme('garish', ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff']);
vega.scheme('darkblues5', ['#132437','#264464','#3A6895','#4E8EC8','#61B6FE']);
vega.scheme('darkblues10', ['#132437','#1B324B','#24415F','#2D5074','#356089','#3E70A0','#4781B7','#5092CE','#58A4E6','#61B6FE']);
vega.scheme('bluered5', ['#132437','#463759','#86446E','#C65270','#FA6C60']);
vega.scheme('bluered10', ['#132437','#282D47','#403556','#5B3C62','#77426B','#954770','#B24C71','#CD546F','#E55E69','#FA6C60']);
vega.scheme('midblues5', ['#0B2DA7','#4A4AD3','#7F6CF0','#B193FB','#DEBEF4']);
vega.scheme('midblues10', ['#0B2DA7','#2B3ABD','#4447CF','#5C55DF','#7364EB','#8A75F4','#A086F9','#B697FB','#CAAAF9','#DEBEF4']);

// http://tristen.ca/hcl-picker/#/clh/5/238/072741/70AFF6
vega.scheme('newblues5', ['#072741', '#1A466D', '#32679A', '#4F8AC8', '#70AFF6']);
vega.scheme('newblues10', ['#072741', '#0E3454', '#174268', '#21507C', '#2D5F90', '#396FA4', '#457EB9', '#538ECD', '#619EE1', '#70AFF6']);

// http://tristen.ca/hcl-picker/#/hlc/10/1.11/3A1916/E9FA64
vega.scheme('purpleyellow10', ['#3A1916', '#552832', '#663D57', '#67597D', '#53799D', '#2A9AAE', '#00B8AC', '#4DD499', '#98EB7D', '#E9FA64']);
vega.scheme('interleaved10', ['#3C2333', '#7BF89D', '#5B4A69', '#93C057', '#6879A2', '#928930', '#5BAFD6', '#7C5721', '#2EE8FC', '#572E1A']);

let colours = {
    'Coal': '#231f20',
    'Manufactured fuel': '#453b3e',
    'Primary oils': '#504975',
    'Petroleum products': '#005154',
    'Natural gas': '#29aae2',
    'Bioenergy and waste': '#754c29',
    'Electricity': '#fdbb63',
    'Other generators': '#fdbb63',
    'Heat sold': '#d14e2a',
    'energy': '#999',
    'Primary electricity': '#e5006d'
}
let energy_colours = ['#231f20', '#453b3e', '#504975', '#005154', '#29aae2', '#754c29', '#fdbb63', '#fdbb63', '#d14e2a', '#453b3e', '#999'];
vega.scheme('energy_colours', energy_colours);


/**
* 
* aggregate_over_fields
* 
* @param fuel_lookup		object	look-up table of what fuels to group together
* @param aggregate_id		integer	ID number for elements that have been joined together
* @param use_split_name		boolean	
* @param resp_data			array of objects	passed by reference, so changes the calling object
* 
*/
                                
// aggregate_over_fields(fuel_LUT, 0, true, response.data);
var aggregate_over_fields = function(fuel_lookup, aggregate_id, use_split_name, resp_data) {
    var fuel_details, fuel_ref, fuel_name;
    for (let j = 0; j < resp_data.length; j++) {
        fuel_details = resp_data[j].fuel.split(':');
        fuel_ref = parseInt(fuel_details[0]);
        fuel_name = fuel_details[1];
        
        if((fuel_lookup[fuel_name] == 0) || (typeof(fuel_lookup[fuel_name]) == 'undefined') ) {
            resp_data[j].fuel = 'All other fuels';
            resp_data[j].fuel_index = aggregate_id;
        } else {
            resp_data[j].fuel = use_split_name? fuel_name : resp_data[j].fuel;
            resp_data[j].fuel_index = fuel_lookup[fuel_name];
        }
    }
}

/*
graph_specs.push({
    title: "Production of primary fuels",
    element: "#production_of_primary_fuels_graph",
    type: "production_of_primary_fuels",
    data_url: base_data_url + "energy/dukes/coal/primary_oils/natural_gas/bioenergy_and_waste/primary_electricity/production?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
    tooltip_fields: [{field: "fuel", title: "Fuel", formatType: "string"}],
    vega_spec: {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    "title": null,
    "data": {"values": null},
    "transform":[
        {
            "calculate":"'' + datum.year",
            "as":"Year"
        }
    ],
    "width": 700,
    "height": 400,
    "mark": "area",
    "encoding": {
        "x": {
            "field": "Year",
            "type": "temporal",
            "axis": {"title": "Year", "format": "%Y", "grid": false}
        },
        "y": {"field": "energy","type": "quantitative", "axis": {"title": "Energy (ktoe)", "grid": false}},
        "color": {"field": "fuel", "type": "nominal", "scale": {"scheme": "newblues5", "domain": ["Coal", "Bioenergy and waste", "Primary electricity", "Natural gas", "Primary oils"]}
        },
        "order": {
            "field": "fuel_index",
            "type": "quantitative",
            "sort": "descending"
        }
    }
    
}
});




graph_specs.push({
    title: "Import dependency",
    element: "#import_dependency_graph",
    type: "import_dependency_from_individual_fuels",
    data_url: base_data_url + "energy/dukes/aggregate_energy_balance/imports/exports/marine_bunkers/total_supply?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
    tooltip_fields: null,
    vega_spec: {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    "title": null,
    "data": {"values": null},
    "transform":[
        {
            "calculate":"'' + datum.year",
            "as":"Year"
        }
    ],
    "width": 700,
    "height": 400,
    "mark": "line",
    "encoding": {
        "x": {
            "field": "Year",
            "type": "temporal",
            "axis": {"title": "Year", "format": "%Y", "grid": false}
        },
        "y": {"field": "energy","type": "quantitative", "axis": {"title": "Percentage of energy supply"}},
        "color": {"field": "percentage", "type": "nominal", "scale": {"scheme": "newblues5"}},
        "detail": {
            "field": "percentage",
            "type": "ordinal"
        }
    }
    
}
});
*/

graph_specs.push({
    title: "Imports by fuel over time",
    element: "#imports_by_fuel_over_time_graph",
    type: "imports_by_fuel_over_time",
    data_url: base_data_url + "energy/dukes/coal/manufactured_fuel/primary_oils/petroleum_products/natural_gas/bioenergy_and_waste/primary_electricity/electricity_aggregate/imports?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
    tooltip_fields: [{field: "fuel", title: "Fuel", formatType: "string"}],
    vega_spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "title": null,
        "data": {"values": null},
        "transform":[
            {
                "calculate":"'' + datum.year",
                "as":"Year"
            }
        ],
        "width": 700,
        "height": 400,
        "mark": "area",
        "encoding": {
            "x": {
                "timeUnit": "yearmonth", "field": "Year", "type": "temporal",
                "axis": {"title": "Year", "format": "%Y", "grid": false}
            },
            "y": {
                "aggregate": "sum", "field": "energy", "type": "quantitative", "axis": {"title": "Energy (ktoe)", "grid": false}
            },
            "color": {"field": "fuel", "type": "nominal", "scale": {"scheme": "newblues5", "domain": ['All other fuels', 'Coal', 'Petroleum products', 'Natural gas', 'Primary oils']}},
            "order": {
                "field": "fuel_index",
                "type": "quantitative",
                "sort": "descending"
            }
        }
    }
});


graph_specs.push({
    title: "Low carbon supply over time",
    element: "#low_carbon_supply_graph",
    type: "low_carbon_supply",
    data_url: [	base_data_url + "energy/dukes/aggregate_energy_balance/total_supply/non_energy_use?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
                base_data_url + "energy/dukes/primary_electricity/transformation?format=json&unit=original&aggregation=absolute&year_start=" + yr_start + "&year_end=" + yr_end,
                base_data_url + "energy/dukesrenewablesources/onshore_wind/offshore_wind/marine_energy_wave_and_tidal_stream/solar_heating_and_photovoltaics/hydro/bioenergy/deep_geothermal/heat_pumps/transport_biofuels?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
            ],
    tooltip_fields: null,
    vega_spec: {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    "title": null,
    "data": {"values": null},
    "transform":[
        {
            "calculate":"'' + datum.year",
            "as":"Year"
        }
    ],
    "width": 700,
    "height": 400,
    "mark": "line",
    "encoding": {
        "x": {
            "field": "year",
            "type": "temporal",
            "axis": {"title": "Year", "format": "%Y", "grid": false}
        },
        "y": {"field": "energy","type": "quantitative", "axis": {"title": "Percentage of energy supply"}},
        "color": {"field": "percentage", "type": "nominal", "scale": {"scheme": "newblues10"}}
    }
    
}
});
                        
graph_specs.push({
    title: "Primary demand by fuel",
    element: "#primary_demand_by_fuel_graph",
    type: "primary_demand_by_fuel",
    data_url: base_data_url + "energy/dukes/coal/manufactured_fuel/primary_oils/petroleum_products/natural_gas/bioenergy_and_waste/primary_electricity/electricity_aggregate/heat_sold/total_demand?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
    tooltip_fields: [{field: "fuel", title: "Fuel", formatType: "string"}],
    vega_spec: {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    "title": null,
    "data": {"values": null},
    "transform":[
        {"calculate":"'' + datum.year",
         "as":"Year"}
    ],
    "width": 700,
    "height": 400,
    "mark": "line",
    "encoding": {
        "x": {
            "field": "Year",
            "type": "temporal",
            "axis": {"title": "Year", "format": "%Y", "grid": false}
        },
        "y": {"aggregate": "sum", "field": "energy", "type": "quantitative", "axis": {"title": "Energy (ktoe)"}},
        "color": {"field": "fuel", "type": "nominal", "scale": {"scheme": "energy_colours"}},
        }
    }
});

/*
graph_specs.push({
    title: "Final consumption by fuel",
    element: "#final_consumption_by_fuel_graph",
    // type: "raw",
    type: "final_consumption_by_fuel",
    data_url: base_data_url + "energy/dukes/coal/manufactured_fuel/primary_oils/petroleum_products/natural_gas/bioenergy_and_waste/primary_electricity/electricity_aggregate/heat_sold/final_consumption?format=json&unit=original&year_start=" + yr_start + "&year_end=" + yr_end,
    tooltip_fields: [{field: "fuel", title: "Fuel", formatType: "string"}],
    vega_spec: {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
    "title": null,
    "data": {"values": null},
    "transform":[
        {
            "calculate":"'' + datum.year",
            "as":"Year"
        }
    ],
    "width": 700,
    "height": 400,
    "mark": "area",
    "encoding": {
        "x": {
            "field": "Year",
            "type": "temporal",
            "axis": {"title": "Year", "format": "%Y", "grid": false}
        },
        "y": {"aggregate": "sum", "field": "energy", "type": "quantitative", "axis": {"title": "Energy (ktoe)", "grid": false}},
        "color": {"field": "fuel", "type": "nominal", "scale": {"scheme": "newblues10"}}
    }
    
}
});
*/

// helper function for multiple  ajax queries
var query_server = function(url) {
    // console.log(url);
    return axios.get(url);
}


for (let i = 0; i < graph_specs.length; i++) {
    
    graph_specs[i].vega_spec.title = graph_specs[i].title + " " + yr_start + "-" + yr_end;
    
    
    
    // low_carbon_supply is a special case as it needs 3 queries
    if (graph_specs[i].type == 'low_carbon_supply') {
    
        var dimension_info_urls = [];

        graph_specs[i].data_url.forEach(function(url) {
            dimension_info_urls.push( query_server(url) );
        });
    
        axios.all(dimension_info_urls)
            .then(axios.spread(function () {
                var response_data = [];
                var aggregate = {'Balance': {} };
                for (let i = 0; i < arguments.length; i++) {
                    if (response_data.length == 0) 
                        response_data = arguments[i].data;
                    else {
                        response_data = _.concat(response_data, arguments[i].data);
                    }
                }

                var aggregate = {low_carbon: {}, denominator: {}};
            
                //first organise data by type and year (i.e. timeseries for each type)
                for (let j = 0; j < response_data.length; j++) {
                    if (typeof(aggregate[response_data[j].item]) == 'undefined') {
                        aggregate[response_data[j].item] = {};
                    }
            
                    if (typeof(aggregate[response_data[j].item]['' + response_data[j].year]) == 'undefined') {
                        aggregate[response_data[j].item]['' + response_data[j].year] = {'energy': response_data[j].energy};
                    } else {
                        aggregate[response_data[j].item]['' + response_data[j].year].energy += response_data[j].energy;
                    }
                }
                
                var low_carbon_keys = _.keys(aggregate);
                var denominator_keys = ["Primary supply", "Non energy use"];
                
                // remove those elements that aren't low-carbon - 
                // do it by removing non-LC to give flexibility in what is included in LC
                ["low_carbon", "denominator", "Primary supply", "Non energy use"].forEach(function(exclude){
                    low_carbon_keys = low_carbon_keys.filter(item => (item !== exclude));
                });											
                
                var kPS = _.keys(aggregate["Primary supply"]);// any key will do - just want array of years
                var final_balance = [];
                
                var energy_value;
                for (let j = 0; j < kPS.length; j++) {
            
                    if (typeof(aggregate['low_carbon'][kPS[j]]) == 'undefined') {
                        energy_value = 0;
                        low_carbon_keys.forEach(function(low_carbon_fuel){
                            energy_value += aggregate[low_carbon_fuel][kPS[j]].energy;
                        });
                        aggregate['low_carbon'][kPS[j]] = {'energy': energy_value};
                    }
                    
                    if (typeof(aggregate['denominator'][kPS[j]]) == 'undefined') {
                        aggregate.denominator[kPS[j]] = {'energy': ( (aggregate['Primary supply'][kPS[j]].energy - aggregate['Non energy use'][kPS[j]].energy) )};
                    }
                    
                    final_balance.push({year: kPS[j], energy: 100 * (aggregate['low_carbon'][kPS[j]].energy / aggregate['denominator'][kPS[j]].energy), percentage: 'UK energy from low carbon sources'})
            
                }
                // console.log(JSON.stringify(final_balance));
                graph_specs[i].vega_spec.data.values = final_balance;
                vegaEmbed(graph_specs[i].element, graph_specs[i].vega_spec, vopt);

            }))
            .catch(function (error) {
                console.log('ERROR:', graph_specs[i].title);
                console.log(error);
            });
        
    } else {
    
        axios.get(graph_specs[i].data_url)
            .then(function (response) {
            
                // console.log('response', response);
                
                switch(graph_specs[i].type) {
                                                                
                
                    case 'import_dependency_from_individual_fuels':
                        // console.log(response.data);
                        var aggregate = {net_imports: {}, denominator: {} };
                    
                        //first organise data by type and year (i.e. timeseries for each type)
                        for (let j = 0; j < response.data.length; j++) {
                            if (typeof(aggregate[response.data[j].item]) == 'undefined') {
                                aggregate[response.data[j].item] = {};
                            }
                    
                            if (typeof(aggregate[response.data[j].item]['' + response.data[j].year]) == 'undefined') {
                                aggregate[response.data[j].item]['' + response.data[j].year] = {'energy': response.data[j].energy};
                            } else {
                                aggregate[response.data[j].item]['' + response.data[j].year].energy += response.data[j].energy;
                            }
                        }
                    
                        var kPS = _.keys(aggregate["Primary supply"]);
                        var final_balance = [];
                    
                        // now use the keys of one of the elements just aggregated (should all be same length, unless data missing)
                        // to loop through the years and perform final calculations (here, net_imports/denominator)
                        for (let j = 0; j < kPS.length; j++) {
                    
                            if (typeof(aggregate.net_imports[kPS[j]]) == 'undefined') {
                                aggregate.net_imports[kPS[j]] = {'energy': ( (aggregate['Imports'][kPS[j]].energy + aggregate['Exports'][kPS[j]].energy) )};
                            } else {
                                console.log("net_imports: probably shouldn't be here?")
                                aggregate.net_imports[kPS[j]].energy = aggregate.net_imports[kPS[j]].energy + ( (aggregate['Imports'][kPS[j]].energy + aggregate['Exports'][kPS[j]].energy) );
                            }
                    
                            if (typeof(aggregate.denominator[kPS[j]]) == 'undefined') {
                                aggregate.denominator[kPS[j]] = {'energy': ( (aggregate['Marine bunkers'][kPS[j]].energy + aggregate['Primary supply'][kPS[j]].energy) )};
                            } else {
                                console.log("denominator: probably shouldn't be here?")
                                aggregate.denominator[kPS[j]].energy = aggregate.denominator[kPS[j]].energy + ( (aggregate['Marine bunkers'][kPS[j]].energy + aggregate['Primary supply'][kPS[j]].energy) );
                            }
                        
                            final_balance.push({year: kPS[j], energy: 100 * (aggregate.net_imports[kPS[j]].energy / aggregate.denominator[kPS[j]].energy), percentage: 'Import dependency'})
                        }
                                                                
                        graph_specs[i].vega_spec.data.values = final_balance;
                    break;
                
                    
                    
                    
                    
                    
                    
                    case 'production_of_primary_fuels':
                        console.log(JSON.parse(JSON.stringify(response.data)));
                        
                        for (let j = 0; j < response.data.length; j++) {
                            response.data[j].fuel = response.data[j].fuel.split(':')[1];
                            response.data[j].fuel_index = response.data[j].fuel === 'Coal' ? 0 : response.data[j].fuel === 'Bioenergy and waste' ? 1 : response.data[j].fuel === 'Primary electricity' ? 2 : response.data[j].fuel === 'Natural gas' ? 3 : response.data[j].fuel === 'Primary oils' ? 4 : 5;
                        }
                        console.log(JSON.parse(JSON.stringify(response.data)));
                        graph_specs[i].vega_spec.data.values = response.data;
                    break;
                
                    
                    
                    
                    
                    
                    case 'imports_by_fuel_over_time':
                        var fuel_LUT = {
                                            'Coal': 1,
                                            'Petroleum products': 2,
                                            'Natural gas': 3,
                                            'Primary oils': 4,
                                            'Manufactured fuel': 0,
                                            'Bioenergy and waste': 0,
                                            'Primary electricity': 0,
                                            'Electricity': 0
                                        };
    
                        aggregate_over_fields(fuel_LUT, 0, true, response.data);
                        graph_specs[i].vega_spec.data.values = response.data;
                    break;
                
                    
                    
                    
                    
                    case 'low_carbon_supply':												
                        var aggregate = {'Balance': {} };
                        for (let j = 0; j < response.data.length; j++) {
                            if (typeof(aggregate[response.data[j].item]) == 'undefined') {
                                aggregate[response.data[j].item] = {};
                            }
                    
                            if (typeof(aggregate[response.data[j].item]['' + response.data[j].year]) == 'undefined') {
                                aggregate[response.data[j].item]['' + response.data[j].year] = {'energy': response.data[j].energy};
                            } else {
                                aggregate[response.data[j].item]['' + response.data[j].year].energy += response.data[j].energy;
                            }
                                                                    
                        }
                        var kPS = _.keys(aggregate["Primary supply"]);
                    
                        // graph_specs[i].vega_spec.data.values = final_balance;
                        graph_specs[i].vega_spec.data.values = response.data;// TEMP
                    break;
                    
                    
                    
                    /*
                    Merge: 
                        coal and manufactured fuel together, 
                        oils together, gas, primary electricity, and bioenergy and waste. 
                        We wouldn’t show heat sold or electricity given they are small.
                    */
                    
                    case 'primary_demand_by_fuel':
                        var fuel_LUT = {
                                            'Coal': 1,
                                            'Primary oils': 2,
                                            'Petroleum products': 3,
                                            'Natural gas': 4,
                                            'Bioenergy and waste': 5,
                                            'Primary electricity': 6,
                                            'Manufactured fuel': 0,
                                            'Electricity': 0,
                                            'Heat sold': 0
                                        };
                        aggregate_over_fields(fuel_LUT, 10, false, response.data);
                        
                        graph_specs[i].vega_spec.data.values = response.data;
                        
                        
                        // now take the data passed into vega and recast it for other chart types
                        
                        // Frappe charts data
                        var fc_data = {};
                        for (let j = 0; j < response.data.length; j++) {
                            if (typeof(fc_data[response.data[j].fuel]) == 'undefined') {
                                fc_data[response.data[j].fuel] = {};
                            }
                    
                            if (typeof(fc_data[response.data[j].fuel]['' + response.data[j].year]) == 'undefined') {
                                fc_data[response.data[j].fuel]['' + response.data[j].year] = {'energy': response.data[j].energy};
                            } else {
                                fc_data[response.data[j].fuel]['' + response.data[j].year].energy += response.data[j].energy;
                            }
                        }
                        
                        let ordered_years, ordered_values, fc_datasets = [], ch_datasets = [], value, short_name, fc_energy_colours = [];
                        let ordered_data = _.keys(fc_data).sort();
                        let plotly_datasets = [];
                        
                        let plotly_template = {
                            x: null,
                            y: null,
                            mode: 'lines+markers',
                            name: 'Scatter',
                            marker: {color: '#c9e516', size: 5},
                            line: {color: '#c9e516', width: 2}
                        };
                        
                        _.forEach(ordered_data, function(key) {
                            value = fc_data[key];
                            ordered_values = [];
                            ordered_years = _.keys(value).sort(function(a,b){return a - b;});
                            _.forEach(ordered_years, function(yr) {
                                ordered_values.push(_.round(value[yr].energy));
                            });
                            short_name = key.split(':');
                            short_name = (short_name.length == 2) ? short_name[1] : key;
                            
                            let tp = _.cloneDeep(plotly_template);
                            tp.name = short_name;
                            console.log(short_name, colours[short_name]);
                            if ( typeof(colours[short_name]) != 'undefined' ) {
                                fc_energy_colours.push(colours[short_name]);
                                tp.marker.color = colours[short_name];
                                tp.line.color = colours[short_name];
                            } else {
                                fc_energy_colours.push('#c9e516');
                                tp.marker.color = '#c9e516';
                                tp.line.color = '#c9e516';
                            }
                            
                            fc_datasets.push({name: short_name, type: "line", values: ordered_values});
                            ch_datasets.push(_.clone(ordered_values));
                            tp.x = ordered_years;
                            tp.y = _.clone(ordered_values);
                            plotly_datasets.push(_.clone(tp));
                            
                        });
                        
                        
                        
                        
                        // Frappe charts
                        
                        let data = {
                            labels: ordered_years,
                            datasets: fc_datasets
                        }
                        
                        const chart = new frappe.Chart("#primary_demand_by_fuel_fc", {
                            title: "Primary demand by fuel",
                            data: data,
                            type: 'line',
                            height: 600,
                            colors: fc_energy_colours,
                            lineOptions: {hideDots: 0, dotSize: 3},
                            axisOptions: {xAxisMode: 'tick', yAxisMode: 'span', xIsSeries: true}
                        });
                        
                        
                        
                        // Chartist
                        
                        new Chartist.Line('#primary_demand_by_fuel_chartist', {
                            labels: ordered_years,
                            series: ch_datasets
                        }, {
                            width: 800,
                            height: 450,
                            fullWidth: true,
                            chartPadding: {right: 40},
                            lineSmooth: Chartist.Interpolation.none({fillHoles: false})
                        });
                        
                        
                        
                        
                        // Plotly
                        
                        var layout = {
                            title:'Primary demand by fuel',
                            width: 1000,
                            height: 600,
                            xaxis: {
                                title: 'Year',
                                showgrid: false,
                                zeroline: true
                            },
                            yaxis: {
                                title: 'Energy (ktoe)',
                                showline: false
                            }
                        };
                        
                        Plotly.newPlot('primary_demand_by_fuel_plotly', plotly_datasets, layout);                        
                        
                    break;
                    
                    
                    
                    
                    
                    case 'final_consumption_by_fuel':
                        var fuel_LUT = {
                                            'Coal': 1,
                                            'Primary oils': 2,
                                            'Petroleum products': 3,
                                            'Natural gas': 4,
                                            'Bioenergy and waste': 5,
                                            'Primary electricity': 6,
                                            'Manufactured fuel': 0,
                                            'Electricity': 0,
                                            'Heat sold': 0
                                        };
    
                        aggregate_over_fields(fuel_LUT, 10, false, response.data);
                        graph_specs[i].vega_spec.data.values = response.data;
                    break;
                    
                    
                    
                
                    default:
                        graph_specs[i].vega_spec.data.values = response.data;
                    break;
                }
            
                var tooltip_options = {
                    showAllFields: false,
                    fields: [{field: "fuel", title: "Fuel", formatType: "string"}],
                    delay: 80,
                    colorTheme: "light"
                };
                
                vegaEmbed(graph_specs[i].element, graph_specs[i].vega_spec, vopt)
                    .then(function(result) {
                        // console.log(result);
                        if(graph_specs[i].tooltip_fields) {
                            tooltip_options.fields = graph_specs[i].tooltip_fields;
                            vegaTooltip.vegaLite(result.view, graph_specs[i].vega_spec, tooltip_options);
                        }

                    })
                    .catch(console.error);
            })
            .catch(function (error) {
                console.log('ERROR:', graph_specs[i].title);
                console.log(error);
            });
    }
}


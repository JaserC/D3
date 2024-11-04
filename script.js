let svg = d3.select('svg')
let map = d3.map()
let path = d3.geoPath()

let mapUrl = 'https://d3js.org/us-10m.v1.json'
let dataUrl = 'data/election-data.csv'

let div = d3.select('body').append('div')
            .attr('class', 'tooltip')

function numFormat(num) {
  return (+num).toLocaleString()
}

// Define zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Limit the zoom scale, adjust as needed
    .on("zoom", (event) => {
        g.attr("transform", event.transform); // Apply zoom transformation to the map group
    });

d3.queue()
    .defer(d3.json, mapUrl)
    .defer(d3.csv, dataUrl, (d) => {
      map.set(d.county_fips, {
        winPercent: d.per_gop - d.per_dem,
        countyName: d.county_name,
        votesDem: d.votes_dem,
        votesGop: d.votes_gop,
        votesTotal: d.total_votes
      });
    })
    .await((error, us) => {
      if (error) throw Error(error);

      // Append a group element to hold all the map paths, allowing us to zoom and pan the map
      const g = svg.append("g");

      g.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append('path')
            .attr('fill', (d) => {
              let dataPoint = map.get(parseInt(d.id));
              dataPoint = dataPoint ? dataPoint.winPercent : 0.05;

              if (dataPoint >= 0.05) return '#f44336';
              if (dataPoint > 0) return '#ef9a9a';
              if (dataPoint >= -0.05) return '#bbdefb';
              return '#2196f3';
            })
            .attr('d', path)
            .on('mouseover', (d) => {
              d = map.get(parseInt(d.id));
              div.transition()
                .duration(200)
                .style('opacity', 0.9);

              div.html(
                `<b>County:</b> ${d.countyName}
                <br/>
                <b>Trump:</b> ${numFormat(d.votesGop)}
                <br/>
                <b>Biden:</b> ${numFormat(d.votesDem)}
                <br/>
                <b>Total:</b> ${numFormat(d.votesTotal)}`
              )
              .style('left', (d3.event.pageX + 15) + 'px')
              .style('top', (d3.event.pageY - 28) + 'px');
            });

      // Draw county borders
      g.append('path')
         .datum(topojson.mesh(us, us.objects.counties, (a, b) => a !== b))
         .attr('class', 'county-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#FFFFFF')
         .attr('stroke-width', 0.2);

      // Draw state borders
      g.append('path')
         .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
         .attr('class', 'state-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#9c9898')
         .attr('stroke-width', 1.0);

      // Apply the zoom behavior to the SVG element
      svg.call(zoom);
    });

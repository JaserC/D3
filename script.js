let svg = d3.select('svg')
let map = d3.map()
let path = d3.geoPath()

let mapUrl = 'https://d3js.org/us-10m.v1.json'
let dataUrl = 'data/election-data.csv'

let div = d3.select('body').append('div')
            .attr('class', 'tooltip')

function numFormat (num) {
    // Round and add comma to numbers for display
  return (+num).toLocaleString()
}

d3.queue()
    .defer(d3.json, mapUrl)
    .defer(d3.csv, dataUrl, (d) => {
        // Add data to map for mapping to topojson in the future
      map.set(d.county_fips, {
        winPercent: d.per_gop - d.per_dem,
        countyName: d.county_name,
        votesDem: d.votes_dem,
        votesGop: d.votes_gop,
        votesTotal: d.total_votes
      })
    }).await((error, us) => {
      if (error) throw Error(error)
      svg.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append('path')
            .attr('fill', (d) => {
              let dataPoint = map.get(parseInt(d.id))
              dataPoint = dataPoint ? dataPoint.winPercent : 0.05

                // Base county colors on win % per county
              if (dataPoint >= 0.05) return '#f44336'
              if (dataPoint > 0) return '#ef9a9a'
              if (dataPoint >= -0.05) return '#bbdefb'
              return '#2196f3'
            })
            .attr('d', path)
            .on('mouseover', (d) => {
                // add tooltip on hover with information about the race
              d = map.get(parseInt(d.id))
              div.transition()
                    .duration(200)
                    .style('opacity', 0.9)

              div.html(
                        `<b>County:</b> ${d.countyName}
                        <br/>
                        <b>Trump:</b> ${numFormat(d.votesGop)}
                        <br/>
                        <b>Biden:</b> ${numFormat(d.votesDem)}
                        <br/>
                        <b>Total:</b> ${numFormat(d.votesTotal)}`
                    )
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px')
            })

        // Fill in the county outlines
    //   svg.append('path')
    //         .datum(topojson.meshus, us.objects.states, (a, b) => {
    //           return a !== b
    //         })
    //         .attr('class', 'states')
    //         .attr('d', path)
    // })

    svg.append('path')
         .datum(topojson.mesh(us, us.objects.counties, (a, b) => a !== b))
         .attr('class', 'county-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#fff')
         .attr('stroke-width', 0.5);

      // Draw state outlines on top of county borders
      svg.append('path')
         .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
         .attr('class', 'state-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#000')  // Black or any preferred color for state borders
         .attr('stroke-width', 1.5); // Thicker stroke for state borders
    });

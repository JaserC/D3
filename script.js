let svg = d3.select('svg')
let map = d3.map()
let path = d3.geoPath()

let mapUrl = 'https://d3js.org/us-10m.v1.json'
let dataUrl = 'data/election-data.csv'

let div = d3.select('body').append('div')
            .attr('class', 'tooltip')

function numFormat (num) {
  return (+num).toLocaleString()
}

d3.queue()
    .defer(d3.json, mapUrl)
    .defer(d3.csv, dataUrl, (d) => {
      map.set(d.county_fips, {
        winPercent: d.per_point_diff,
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
              let blue = ['#7aa3f5', '#476fbf', '#2750a1', '#012c80']
              let red = ['#f07373', '#d15252', '#b82c2c', '#8f0303']
              if (dataPoint){
                if (dataPoint.votesDem >= dataPoint.votesGop){
                  return blue[Math.floor(dataPoint.per_point_diff / 0.25)]
                }
                else{
                  return red[Math.floor(dataPoint.per_point_diff / 0.25)]
                }
              }
              return '#808080'
            })
            .attr('d', path)
            .on('mouseover', (d) => {
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
                    .style('left', (d3.event.pageX + 15) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px')
            })

    svg.append('path')
         .datum(topojson.mesh(us, us.objects.counties, (a, b) => a !== b))
         .attr('class', 'county-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#FFFFFF')
         .attr('stroke-width', 0.2);

      svg.append('path')
         .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
         .attr('class', 'state-borders')
         .attr('d', path)
         .attr('fill', 'none')
         .attr('stroke', '#FFFFFF')  
         .attr('stroke-width', 4.0); 
    });

const units = '';
const margin = {top: 10, right: 10, bottom: 10, left: 50};
const width = 800 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// zero decimal places
const formatNumber = d3.format(',.0f');

const format = d => `${formatNumber(d)} ${units}`;

const color = d3.scaleOrdinal()
  .domain([
  'Drama',
    'Biography',
    'Music',
    'Comedy',
    'History',
    'Fantasy',
    'Thriller'
  ])
  .range([
    '#90eb9d',
    '#f9d057',
    '#f29e2e',
    '#00ccbc',
    '#56307E',
    '#E271C1',
    '#534635'
  ]);

d3.select('#chart')
  .style('visibility', 'visible');

// append the svg canvas to the page
const svg5 = d3.select('#sankey').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// set the sankey diagram properties
const sankey = d3.sankey()
  .nodeWidth(6)
  .nodePadding(10)
  .size([width, height]);

const path = sankey.link();

// append a defs (for definition) element to your SVG
const defs = svg5.append('defs');

// load the data
d3.json('data/sankey_data.json', (error, graph) => {
  console.log('graph', graph);
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(13); // any value > 13 breaks the link gradient

  // add in the links
  const link = svg5.append('g').selectAll('.link')
    .data(graph.links)
    .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', d => Math.max(1, d.dy))
      .style('fill', 'none')
      .style('stroke-opacity', 0.18)
      .sort((a, b) => b.dy - a.dy)
      .on('mouseover', function() {
        d3.select(this).style('stroke-opacity', 0.5);
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke-opacity', 0.2);
      });

  // add the link titles
  link.append('title')
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

  // add in the nodes
  const node = svg5.append('g').selectAll('.node')
    .data(graph.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .subject(d => d)
        .on('start', function() {
          this.parentNode.appendChild(this); })
        .on('drag', dragmove));

  // add the rectangles for the nodes
  node.append('rect')
    .attr('height', d => d.dy)
    .attr('width', sankey.nodeWidth())
    .style('fill', d => {
      if(color.domain().indexOf(d.name) > -1){
        return d.color = color(d.name);
      } else {
        return d.color = '#A9261C'; //ccc
      }
    })
    .append('title')
      .text(d => `${d.name}\n${format(d.value)}`);

  // add in the title for the nodes
  node.append('text')
    .attr('x', -6)
    .attr('y', d => d.dy / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(d => d.name)
    .filter(d => d.x < width / 2)
      .attr('x', 6 + sankey.nodeWidth())
      .attr('text-anchor', 'start');

  // add gradient to links
  link.style('stroke', (d, i) => {
    console.log('d from gradient stroke func', d);

    // make unique gradient ids
    const gradientID = `gradient${i}`;

    const startColor = d.source.color;
    const stopColor = d.target.color;

    console.log('startColor', startColor);
    console.log('stopColor', stopColor);

    const linearGradient = defs.append('linearGradient')
        .attr('id', gradientID);

    linearGradient.selectAll('stop')
      .data([
          {offset: '10%', color: startColor },
          {offset: '90%', color: stopColor }
        ])
      .enter().append('stop')
      .attr('offset', d => {
        console.log('d.offset', d.offset);
        return d.offset;
      })
      .attr('stop-color', d => {
        console.log('d.color', d.color);
        return d.color;
      });

    return `url(#${gradientID})`;
  })

// the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr('transform',
      `translate(${d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))},${d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))})`);
    sankey.relayout();
    link.attr('d', path);
  }
});

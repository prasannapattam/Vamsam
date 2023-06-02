/* eslint-disable @typescript-eslint/no-explicit-any */

import * as d3 from 'd3';

export class TreePlot {
  drawTree(): void {
    const root = {
      name: '',
      id: 1,
      hidden: true,
      children: [
        {
          name: 'Subramanyam Pattam',
          id: 16,
          no_parent: true,
        },
        {
          name: '',
          id: 2,
          no_parent: true,
          hidden: true,
          children: [
            {
              name: 'Pradeep Pattam',
              id: 12,
            },
            {
              name: 'Vijaya Gowri Bandaru',
              id: 13,
              no_parent: true,
            },
            {
              name: 'Praveen Pattam',
              id: 3,
            },
            {
              name: '',
              id: 4,
              hidden: true,
              no_parent: true,
              children: [
                {
                  name: 'Sanjana Pattam',
                  id: 5,
                },
                {
                  name: 'Mainetha Pattam',
                  id: 6,
                },
              ],
            },
            {
              name: 'Anupama Pattam',
              id: 31,
              no_parent: true,
            },
            {
              name: 'Prasanna Kumar Pattam',
              id: 11,
            },
            {
              name: '',
              id: 7,
              hidden: true,
              no_parent: true,
              children: [
                {
                  name: 'Praval Pattam',
                  id: 8,
                },
                {
                  name: 'Prakul Pattam',
                  id: 9,
                },
              ],
            },
            {
              name: 'Mrudula Mekala',
              id: 11,
              no_parent: true,
            },
          ],
        },
        {
          name: 'Shakunthala Chinnakotla',
          id: 10,
          no_parent: true,
          children: [],
        },
      ],
    };

    const spouses = [
      {
        source: {
          id: 3,
          name: 'C',
        },
        target: {
          id: 11,
          name: 'K',
        },
      },
      {
        source: {
          id: 12,
          name: 'L',
        },
        target: {
          id: 13,
          name: 'J',
        },
      },
      {
        source: {
          id: 5,
          name: 'D',
        },
        target: {
          id: 6,
          name: 'E',
        },
      },
      {
        source: {
          id: 16,
          name: 'Q',
        },
        target: {
          id: 10,
          name: 'M',
        },
      },
    ];

    // set the dimensions and margins of the diagram
    const margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

    //a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    //  assigns the data to a hierarchy using parent-child relationships
    let nodes = d3.hierarchy(root, function (d: any) {
      return d.children;
    });

    // maps the node data to the tree layout
    nodes = treemap(nodes);
    console.log(nodes);
    console.log(nodes.descendants());

    // create svg object
    const svg = d3
        .select('#family-tree')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom),
      g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // adds the links between parent & child
    g.selectAll('.child-line')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'child-line')
      .attr('d', this.childLine);

    g.selectAll('.spouse-line')
      .data(spouses)
      .enter()
      .append('path')
      .attr('class', 'spouse-line')
      .attr('d', this.spouseLine);

    // adds each node as a group
    const gnodes = g.selectAll('.node').data(nodes.descendants()).enter();

    // drawing boxes for each person
    gnodes
      .append('rect')
      .attr('class', 'node')
      .attr('height', 20)
      .attr('width', 120)
      .attr('id', (d) => d.data.id)
      .attr('display', (d) => (d.data.hidden ? 'none' : ''))
      .attr('x', (d: any) => d.x - 60)
      .attr('y', (d: any) => d.y - 10);

    // add details for each person
    gnodes
      .append('text')
      .text((d) => d.data.name)
      .attr('x', (d: any) => d.x - 3)
      .attr('y', (d: any) => d.y + 3)
      .attr('text-anchor', 'middle');
  }

  childLine(d: any) {
    // console.log(d);
    if (d.data.no_parent) {
      return 'M0,0L0,0';
    }
    const diff = d.y - d.parent.y;
    //0.40 defines the point from where the line to break out
    const ny = d.parent.y + diff * 0.5;

    const linedata = <Iterable<[number, number]>>[
      { x: d.parent.x, y: d.parent.y },
      { x: d.parent.x, y: ny },
      { x: d.x, y: d.y },
    ];

    const line = d3
      .line()
      .x((d: any) => d.x)
      .y((d: any) => d.y)
      .curve(d3.curveStepAfter);
    return line(linedata);
  }

  spouseLine(d: any) {
    // console.log(d);
    const linedata = <Iterable<[number, number]>>[
      { x: d.source.x, y: d.source.y },
      { x: d.target.x, y: d.target.y },
    ];
    const line = d3
      .line()
      .x((d: any) => d.x)
      .y((d: any) => d.y)
      .curve(d3.curveStepAfter);
    return line(linedata);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as d3 from 'd3';

export class TreePlot {
  drawTree(): void {
    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
      width = 840,
      height = 600;
    const kx = function (d: any) {
      return d.x - 20;
    };
    const ky = function (d: any) {
      return d.y - 10;
    };
    //thie place the text x axis adjust this to center align the text
    const tx = function (d: any) {
      return d.x - 3;
    };
    //thie place the text y axis adjust this to center align the text
    const ty = function (d: any) {
      return d.y + 3;
    };
    //make an SVG
    const svg = d3
      .select('#graph')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //My JSON note the
    //no_parent: true this ensures that the node will not be linked to its parent
    //hidden: true ensures that the nodes is not visible.
    const root = {
      name: '',
      id: 1,
      hidden: true,
      children: [
        {
          name: 'Q',
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
              name: 'J',
              id: 12,
            },
            {
              name: 'L',
              id: 13,
              no_parent: true,
            },
            {
              name: 'C',
              id: 3,
            },
            {
              name: '',
              id: 4,
              hidden: true,
              no_parent: true,
              children: [
                {
                  name: 'D',
                  id: 5,
                },
                {
                  name: '',
                  id: 14,
                  hidden: true,
                  no_parent: true,
                  children: [
                    {
                      name: 'P',
                      id: 15,
                    },
                  ],
                },
                {
                  name: 'E',
                  id: 6,
                },
              ],
            },
            {
              name: 'K',
              id: 11,
            },
            {
              name: 'G',
              id: 7,
              children: [
                {
                  name: 'H',
                  id: 8,
                },
                {
                  name: 'I',
                  id: 9,
                },
              ],
            },
          ],
        },
        {
          name: 'M',
          id: 10,
          no_parent: true,
          children: [],
        },
      ],
    };
    const allNodes = flatten(root);
    //This maps the siblings together mapping uses the ID using the blue line
    const siblings = [
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

    // Compute the layout.
    const tree = d3.layout.tree().size([width, height]),
      nodes = tree.nodes(root),
      links = tree.links(nodes);

    // Create the link lines.
    svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', elbow);

    let nodes = svg.selectAll('.node').data(nodes).enter();

    //First draw sibling line with blue line
    svg
      .selectAll('.sibling')
      .data(siblings)
      .enter()
      .append('path')
      .attr('class', 'sibling')
      .attr('d', sblingLine);

    // Create the node rectangles.
    nodes
      .append('rect')
      .attr('class', 'node')
      .attr('height', 20)
      .attr('width', 40)
      .attr('id', function (d: any) {
        return d.id;
      })
      .attr('display', function (d: any) {
        if (d.hidden) {
          return 'none';
        } else {
          return '';
        }
      })
      .attr('x', kx)
      .attr('y', ky);
    // Create the node text label.
    nodes
      .append('text')
      .text(function (d: any) {
        return d.name;
      })
      .attr('x', tx)
      .attr('y', ty);

    /**
    This defines the line between siblings.
    **/
    function sblingLine(d: any) {
      //start point
      const start = allNodes.filter(function (v) {
        if (d.source.id == v.id) {
          return true;
        } else {
          return false;
        }
      });
      //end point
      const end = allNodes.filter(function (v) {
        if (d.target.id == v.id) {
          return true;
        } else {
          return false;
        }
      });
      //define teh start coordinate and end co-ordinate
      const linedata = [
        {
          x: start[0].x,
          y: start[0].y,
        },
        {
          x: end[0].x,
          y: end[0].y,
        },
      ];
      const fun = d3.svg
        .line()
        .x(function (d: any) {
          return d.x;
        })
        .y(function (d: any) {
          return d.y;
        })
        .interpolate('linear');
      return fun(linedata);
    }

    /*To make the nodes in flat mode.
    This gets all teh nodes in same level*/
    function flatten(root: any) {
      const n: any[] = [];
      let i = 0;

      function recurse(node: any) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        n.push(node);
      }
      recurse(root);
      return n;
    }
    /**
    This draws the lines between nodes.
    **/
    function elbow(d: any) {
      if (d.target.no_parent) {
        return 'M0,0L0,0';
      }
      const diff = d.source.y - d.target.y;
      //0.40 defines the point from where you need the line to break out change is as per your choice.
      const ny = d.target.y + diff * 0.4;

      const linedata = [
        {
          x: d.target.x,
          y: d.target.y,
        },
        {
          x: d.target.x,
          y: ny,
        },
        {
          x: d.source.x,
          y: d.source.y,
        },
      ];

      const fun = d3.svg
        .line()
        .x(function (d: any) {
          return d.x;
        })
        .y(function (d: any) {
          return d.y;
        })
        .interpolate('step-after');
      return fun(linedata);
    }
  }
}

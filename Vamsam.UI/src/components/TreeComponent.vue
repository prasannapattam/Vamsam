<template>
  <div class="chart-container" style="width: 100%; min-height: inherit"></div>
</template>
<style lang="sass">
.person-member
  display: flex
  flex-wrap: wrap
  height: 40px
  align-items: center
  justify-content: center
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24)

.male-member
  background: radial-gradient(circle, #B0E0E6 0%, #00CED1 100%)
.female-member
  background: radial-gradient(circle, #FFB6C1 0%, #FF69B4 100%)

.female-spouse
  margin-left: -15px

.male-spouse
  margin-right: -15px

div.line
  margin-top: 13px
  width: 5px
  hr
    border-style: solid
    border-width: 2px 0 0

.person-icon
  padding-top: 3px
  width:40px
  height:30px

.person-name
  text-align: left
  justify-content: center

.selected-person
  border: 4px solid #152785
</style>

<script setup lang="ts">
import * as d3 from 'd3';
import { OrgChart } from '../services/d3-org-chart';
import { onMounted } from 'vue';
import { FamilyModel } from '../models/family-model';
import { PersonModel } from 'src/models/person-model';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';

// class variables
let chart: OrgChart;
let selectedPersonId: string;
let treeData: FamilyModel[];

onMounted(() => {
  treeData = getTreeData(); // get the family data
  renderChart(treeData);
});

function renderChart(data: FamilyModel[]) {
  // variables used in tree
  const nodeWidth = 150;
  const nodeWidthSpouse = 320;
  const gapWidth = nodeWidthSpouse - nodeWidth * 2;
  const linkShift = Math.round((nodeWidth + gapWidth) / 2);
  const nodeHeight = 40;
  const nodeHeightSpouse = 40;
  const siblingsMargin = 20;

  chart = new OrgChart()
    .container('.chart-container')
    .data(data)
    .onNodeClick((nodeId: string) => nodeClicked(nodeId))
    .rootMargin(100)
    .nodeWidth((d) => {
      if (d.data.primarySpouseId !== undefined) {
        return nodeWidth;
      }
      return d.data.spouseId !== undefined ? nodeWidthSpouse : nodeWidth;
    })

    .nodeHeight((d) =>
      d.data.spouseId !== undefined ? nodeHeightSpouse : nodeHeight
    )
    .childrenMargin((d) => 30)
    .siblingsMargin((d) => siblingsMargin)
    .neightbourMargin((d) => 10)
    // .compactMarginBetween((d) => 175)
    // .compactMarginPair((d) => 80)
    .linkUpdate(function (d, i, arr) {
      // drawing the connecting line
      if (d.data.primarySpouseId !== undefined) {
        return;
      } else {
        d3.select(this)
          .attr('stroke', (d) => 'lightgray')
          .attr('stroke-width', (d) => 2);
      }
    })
    .connectionsUpdate(function (d, i, arr) {
      d3.select(this)
        .attr('stroke', (d) => 'black')
        .attr('stroke-width', (d) => 2);
    })
    .nodeContent(function (d, i, arr, state) {
      const personData: FamilyModel = <FamilyModel>d.data;

      let extraCss = '';
      if (personData.primarySpouseId !== undefined) {
        if (personData.gender === 'M') {
          extraCss = 'female-spouse';
        } else {
          extraCss = 'male-spouse';
        }
      }

      let nodeHtml = `<div class="row ${extraCss}">`;
      if (personData.primarySpouseId !== undefined) {
        nodeHtml += getPersonNodeContent(personData, 'spouse');
      } else if (personData.gender === 'F') {
        nodeHtml += getPersonNodeContent(personData, 'spouse');
        nodeHtml += getPersonNodeContent(personData, 'child');
      } else {
        nodeHtml += getPersonNodeContent(personData, 'child');
        nodeHtml += getPersonNodeContent(personData, 'spouse');
      }
      nodeHtml += '</div>';

      return nodeHtml;
    })
    .compact(false);

  // changing the links for persons who has spouse
  chart.layoutBindings().top.linkX = (d) => {
    let x = d.x;
    if (d.data === undefined) {
      // Using x & y locations get the corresponding person data
      const allNodes = chart.getChartState().allNodes;
      allNodes.forEach((node) => {
        if (node.x === d.x && node.y === d.y) {
          if (node.data.gender === 'M') {
            x = d.x + d.width / 2;
          } else {
            x = d.x - d.width / 2;
          }
        }
      });
    } else if (d.data.spouseId !== undefined && d.data.gender === 'M') {
      x = d.x - linkShift; // for parent to child link
    } else if (d.data.spouseId !== undefined && d.data.gender === 'F') {
      x = d.x + linkShift; // for parent to child link
    } else {
      x = d.x;
    }

    return x;
  };

  chart.layoutBindings().top.linkY = (d) => {
    if (d.data === undefined) {
      // connections
      return d.y + d.height / 2;
    } else {
      return d.y;
    }
  };

  chart.layoutBindings().top.linkJoinX = (d) => {
    let x = d.x;
    if (d.data === undefined) {
      // connections
      // Using x & y locations get the corresponding person data
      const allNodes = chart.getChartState().allNodes;
      allNodes.forEach((node) => {
        if (node.x === d.x && node.y === d.y) {
          if (node.data.gender === 'M') {
            x = d.x - d.width / 2 - 15;
          } else {
            x = d.x + d.width / 2 + 15;
          }
        }
      });
    } else {
      x = d.x;
    }

    return x;
  };
  chart.layoutBindings().top.linkJoinY = (d) => {
    if (d.data === undefined) {
      // connections
      return d.y + d.height / 2;
    } else {
      return d.y;
    }
  };

  // chart.layoutBindings().top.buttonX = (d) => {
  //   return d.width / 2 - 10;
  // };
  // chart.layoutBindings().top.linkParentX = (d) => {
  //   return d.parent.x - 10;
  // };

  // checking for multiple spouses
  const multipleSpouseConnections = [];
  data.forEach((model) => {
    if (model.primarySpouseId !== undefined) {
      multipleSpouseConnections.push({
        from: model.primarySpouseId,
        to: model.id,
      });
    }
  });
  chart.connections(multipleSpouseConnections);

  chart.render().fit();
  // chart.expandAll().fit();
}

function getPersonNodeContent(personData: FamilyModel, personType: string) {
  const person: PersonModel = <PersonModel>{};

  if (personType === 'spouse') {
    person.id = personData.spouseId;
    person.name = personData.spouseName;
    person.gender = personData.spouseGender;
  } else {
    person.id = personData.id;
    person.name = personData.name;
    person.gender = personData.gender;
  }

  if (person.id === undefined) {
    return '';
  } else {
    let personCssClass, personIcon;
    if (person.gender === 'M') {
      personCssClass = 'male-member';
      personIcon = maleIcon;
    } else {
      personCssClass = 'female-member';
      personIcon = femaleIcon;
    }
    let nodeContent = '';
    if (
      personData.spouseId !== undefined &&
      person.gender === 'F' &&
      personData.primarySpouseId === undefined
    ) {
      nodeContent += '<div class="line"><hr/></div>';
    }
    nodeContent += `
        <div class="col ${personCssClass} person-member person-${person.id}" onclick="window.selectedPersonId = '${person.id}';">
          <div class="col-grow">
            <img src="${personIcon}" class="person-icon" />
          </div>
          <div class="col person-name">${person.name}</div>
        </div>`;
    return nodeContent;
  }
}

function nodeClicked(personId: string) {
  chart.setCentered(personId);
  // for each of the childrent set expanded
  treeData.forEach((d) => {
    if (d.parentId === personId) {
      chart.setExpanded(d.id);
    }
  });

  chart.render().fit();

  selectedPersonId = window.selectedPersonId;
  d3.selectAll('.chart-container .person-member').classed(
    'selected-person',
    false
  );
  d3.select(`.chart-container .person-${selectedPersonId}`).classed(
    'selected-person',
    true
  );
}

function getTreeData() {
  const treeData: FamilyModel[] = [
    {
      id: 'L1-L1S',
      childId: 'L1',
      name: 'Grand Father',
      gender: 'M',
      parentId: '',
      childOrder: 1,
      spouseId: 'L1S',
      spouseName: 'Grand Mother',
      spouseGender: 'F',
      spouseOrder: 1,
    },
    {
      id: 'C1-C1S1',
      childId: 'C1',
      name: 'Son 1',
      gender: 'M',
      parentId: 'L1-L1S',
      childOrder: 1,
      spouseId: 'C1S1',
      spouseName: 'Son 1 - Wife 1',
      spouseGender: 'F',
      spouseOrder: 1,
    },
    {
      id: 'C1-C1S2',
      childId: 'C1',
      name: 'Son 1',
      gender: 'M',
      parentId: 'L1-L1S',
      childOrder: 1,
      spouseId: 'C1S2',
      spouseName: 'Son 1 - Wife 2',
      spouseGender: 'F',
      spouseOrder: 2,
      primarySpouseId: 'C1-C1S1',
    },
    {
      id: 'C2-C2S1',
      childId: 'C2',
      name: 'Daughter',
      gender: 'F',
      parentId: 'L1-L1S',
      childOrder: 2,
      spouseId: 'C2S1',
      spouseName: 'Daughter-Husband 1',
      spouseGender: 'M',
      spouseOrder: 1,
      primarySpouseId: 'C2-C2S2',
    },
    {
      id: 'C2-C2S2',
      childId: 'C2',
      name: 'Daughter',
      gender: 'F',
      parentId: 'L1-L1S',
      childOrder: 2,
      spouseId: 'C2S2',
      spouseName: 'Daughter-Husband 2',
      spouseGender: 'M',
      spouseOrder: 1,
    },
    {
      id: 'C3-C3S',
      childId: 'C3',
      name: 'Son 2',
      gender: 'M',
      parentId: 'L1-L1S',
      childOrder: 3,
      spouseId: 'C3S',
      spouseName: 'Son 2 - Wife',
      spouseGender: 'F',
      spouseOrder: 1,
    },
    {
      id: 'G1',
      childId: 'G1',
      name: 'Grand Daughter 1',
      gender: 'F',
      parentId: 'C1-C1S1',
      childOrder: 1,
    },
    {
      id: 'G2',
      childId: 'G2',
      name: 'Grand Son 2',
      gender: 'M',
      parentId: 'C1-C1S1',
      childOrder: 2,
    },
    {
      id: 'G3',
      childId: 'G3',
      name: 'Grand Daughter 3',
      gender: 'F',
      parentId: 'C1-C1S2',
      childOrder: 1,
    },
    {
      id: 'G4',
      childId: 'G4',
      name: 'Grand Son 4',
      gender: 'M',
      parentId: 'C1-C1S2',
      childOrder: 2,
    },
    {
      id: 'G15',
      childId: 'G5',
      name: 'Grand Daughter 5',
      gender: 'F',
      parentId: 'C2-C2S1',
      childOrder: 1,
    },
    {
      id: 'G16',
      childId: 'G5',
      name: 'Grand Daughter 5',
      gender: 'F',
      parentId: 'C2-C2S1',
      childOrder: 1,
    },
    {
      id: 'G17',
      childId: 'G5',
      name: 'Grand Daughter 5',
      gender: 'F',
      parentId: 'C2-C2S1',
      childOrder: 1,
    },
    {
      id: 'G5',
      childId: 'G5',
      name: 'Grand Daughter 5',
      gender: 'F',
      parentId: 'C2-C2S2',
      childOrder: 1,
    },
    {
      id: 'G6',
      childId: 'G6',
      name: 'Grand Daughter 6',
      gender: 'F',
      parentId: 'C2-C2S2',
      childOrder: 2,
    },
    {
      id: 'G7',
      childId: 'G7',
      name: 'Grand Son 7',
      gender: 'M',
      parentId: 'C3-C3S',
      childOrder: 1,
    },
    {
      id: 'G8',
      childId: 'G8',
      name: 'Grand Son 8',
      gender: 'M',
      parentId: 'C3-C3S',
      childOrder: 2,
    },
  ];

  return treeData;
}
</script>

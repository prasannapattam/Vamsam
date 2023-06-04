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
div.line
  margin-top: 13px
  width: 5px
  hr
    border-style: solid
    border-width: 5px 0 0

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

  chart = new OrgChart()
    .container('.chart-container')
    .data(data)
    .onNodeClick((nodeId: string) => nodeClicked(nodeId))
    .rootMargin(100)
    .nodeWidth((d) =>
      d.data.spouseId !== undefined ? nodeWidthSpouse : nodeWidth
    )
    .nodeHeight((d) =>
      d.data.spouseId !== undefined ? nodeHeightSpouse : nodeHeight
    )
    .childrenMargin((d) => 75)
    .siblingsMargin((d) => 30)
    // .compactMarginBetween((d) => 175)
    // .compactMarginPair((d) => 80)
    .linkUpdate(function (d, i, arr) {
      // drawing the connecting line
      d3.select(this)
        .attr('stroke', (d) => 'lightgray')
        .attr('stroke-width', (d) => 2);
      //.attr('stroke-dasharray', '4,4');
    })
    .nodeContent(function (d, i, arr, state) {
      const personData: FamilyModel = <FamilyModel>d.data;

      let nodeHtml = '<div class="row">';
      if (personData.gender === 'F') {
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
    if (d.data.spouseId === undefined) {
      return d.x;
    } else if (d.data.gender === 'M') {
      return d.x - linkShift;
    } else {
      return d.x + linkShift;
    }
  };

  chart.render().fit();
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
    if (personData.spouseId !== undefined && person.gender === 'F') {
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

  console.log(window.selectedPersonId);
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
      id: 'L1',
      name: 'Grand Father Kumar',
      gender: 'M',
      parentId: '',
      spouseId: 'L1S',
      spouseName: 'Grand Mother Kumar',
      spouseGender: 'F',
    },
    {
      id: 'L1C1',
      name: 'Son 1 Kumar',
      gender: 'M',
      parentId: 'L1',
      spouseId: 'L1C1S',
      spouseName: 'Daughter in law',
      spouseGender: 'F',
    },
    {
      id: 'L1C2',
      name: 'Daughter Devi',
      gender: 'F',
      parentId: 'L1',
      spouseId: 'L1C2S',
      spouseName: 'Son in law',
      spouseGender: 'M',
    },
    {
      id: 'L1C3',
      name: 'Son 2 Kumar',
      gender: 'M',
      parentId: 'L1',
      spouseId: 'L1C3S',
      spouseName: 'Daughter in law',
      spouseGender: 'F',
    },
    { id: 'L1C1C1', name: 'Grand Daughter 1', gender: 'F', parentId: 'L1C1' },
    { id: 'L1C1C2', name: 'Grand Son 1', gender: 'M', parentId: 'L1C1' },
    { id: 'L1C2C1', name: 'Grand Daughter 2', gender: 'F', parentId: 'L1C2' },
    { id: 'L1C2C2', name: 'Grand Daughter 3', gender: 'F', parentId: 'L1C2' },
    { id: 'L1C3C1', name: 'Grand Son 2', gender: 'M', parentId: 'L1C3' },
    { id: 'L1C3C2', name: 'Grand Son 3', gender: 'M', parentId: 'L1C3' },
  ];

  return treeData;
}
</script>

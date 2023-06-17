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
import { onMounted, onUnmounted, watch } from 'vue';
import { Loading } from 'quasar';

import { FamilyModel } from '../models/family-model';
import { PersonModel } from 'src/models/person-model';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';
import familyData from 'src/services/family-data.json';
import treeConfiguration from 'src/services/tree-configuration';
import { OrgChart, Connection, NodeId } from 'd3-org-chart';
import { HierarchyNode } from 'd3-hierarchy';
import session from 'src/services/session';

// class variables
let chart: OrgChart<FamilyModel>;
let treeData: FamilyModel[];

onMounted(() => {
  loadTree();
});

onUnmounted(() => {
  window.selectedPersonId = undefined;
});

watch([session.searchPersonId], (newValues, oldValues) => {
  if (newValues[0] !== oldValues[0]) {
    const personId = <string>newValues[0];
    window.selectedPersonId = personId;

    d3.select('.svg-chart-container').remove();
    loadTree();
    // nodeClicked(<NodeId>personId);
  }
});

function loadTree() {
  Loading.show();
  setTimeout(() => {
    treeData = getTreeData(); // get the family data
    renderChart(treeData);
    if (window.selectedPersonId !== undefined) {
      nodeClicked(window.selectedPersonId);
    }
    Loading.hide();
  }, 1000);
}

function renderChart(data: FamilyModel[]) {
  chart = new OrgChart<FamilyModel>()
    .container(treeConfiguration.chartContainer)
    .data(data)
    .onNodeClick((nodeId: NodeId) => nodeClicked(nodeId))
    .rootMargin(treeConfiguration.rootMargin)
    .nodeWidth((d: HierarchyNode<FamilyModel>) => {
      if (d.data.primarySpouseId !== undefined) {
        return treeConfiguration.nodeWidth;
      }
      return d.data.spouseId !== undefined
        ? treeConfiguration.nodeWidthSpouse
        : treeConfiguration.nodeWidth;
    })

    .nodeHeight((d: HierarchyNode<FamilyModel>) =>
      d.data.spouseId !== undefined
        ? treeConfiguration.nodeHeightSpouse
        : treeConfiguration.nodeHeight
    )
    .childrenMargin(() => treeConfiguration.childrenMargin)
    .siblingsMargin(() => treeConfiguration.siblingsMargin)
    .neightbourMargin(() => treeConfiguration.neightbourMargin)
    .linkUpdate(function (d: HierarchyNode<FamilyModel>) {
      // drawing the connecting line
      if (d.data.primarySpouseId !== undefined) {
        return;
      } else {
        d3.select(this)
          .attr('stroke', () => treeConfiguration.linkStroke)
          .attr('stroke-width', () => treeConfiguration.linkStrokeWidth);
      }
    })
    .connectionsUpdate(function () {
      d3.select(this)
        .attr('stroke', () => treeConfiguration.connectionStroke)
        .attr('stroke-width', () => treeConfiguration.connectionStrokeWidth)
        .lower();
    })
    .nodeContent(function (d: HierarchyNode<FamilyModel>) {
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
  chart.layoutBindings().top.linkX = (d: HierarchyNode<FamilyModel>) => {
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
      x = d.x - treeConfiguration.linkShift; // for parent to child link
    } else if (d.data.spouseId !== undefined && d.data.gender === 'F') {
      x = d.x + treeConfiguration.linkShift; // for parent to child link
    } else {
      x = d.x;
    }

    return x;
  };

  chart.layoutBindings().top.linkY = (d: HierarchyNode<FamilyModel>) => {
    if (d.data === undefined) {
      // connections
      return d.y + d.height / 2;
    } else {
      return d.y;
    }
  };

  chart.layoutBindings().top.linkJoinX = (d: HierarchyNode<FamilyModel>) => {
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
  chart.layoutBindings().top.linkJoinY = (d: HierarchyNode<FamilyModel>) => {
    if (d.data === undefined) {
      // connections
      return d.y + d.height / 2;
    } else {
      return d.y;
    }
  };

  // checking for multiple spouses
  const multipleSpouseConnections: Connection[] = [];
  data.forEach((model) => {
    if (model.primarySpouseId !== undefined) {
      multipleSpouseConnections.push({
        from: model.primarySpouseId,
        to: model.id,
        label: '',
      });
    }
  });
  chart.connections(multipleSpouseConnections);

  chart.render();
  chart.expandAll();
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

    const selectedPersonCssClass =
      window.selectedPersonId === person.id ? 'selected-person' : '';

    nodeContent += `
        <div class="col ${personCssClass} person-member person-${person.id} ${selectedPersonCssClass}" onclick="window.selectedPersonId = '${person.id}';">
          <div class="col-grow">
            <img src="${personIcon}" class="person-icon" />
          </div>
          <div class="col person-name">${person.name}</div>
        </div>`;
    return nodeContent;
  }
}

function nodeClicked(personId: NodeId) {
  chart.setCentered(personId);
  // for each of the childrent set expanded
  treeData.forEach((d) => {
    if (d.parentId === personId) {
      chart.setExpanded(d.id);
    }
  });

  chart.render();
}

function getTreeData() {
  return familyData;
}
</script>

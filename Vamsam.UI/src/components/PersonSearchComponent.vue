<template>
  <div class="row items-center">
    <q-select
      ref="personSearchSelect"
      :filled="globalSearchInd"
      :dark="globalSearchInd"
      dense
      v-model="model"
      use-input
      clearable
      fill-input
      hide-selected
      hide-dropdown-icon
      input-debounce="2"
      :label="label"
      :options="options"
      @filter="filterFn"
      @filter-abort="abortFilterFn"
      @update:model-value="personSelected"
      style="width: 350px"
    >
      <template v-slot:prepend v-if="globalSearchInd">
        <q-icon name="search" />
      </template>
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>
      <template v-slot:option="scope">
        <q-item class="q-pb-none q-pt-none" v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-avatar color="blue" text-color="white">
              <img :src="scope.opt.icon" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <div>{{ scope.opt.label }}</div>
              <div class="parents">{{ scope.opt.description }}</div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<style lang="sass" scoped>
.parents
  font-size: 0.8em
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { QSelect } from 'quasar';
import { OptionsModel } from 'src/models/quasar-models';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';
import session from 'src/services/session';

const props = defineProps({
  globalSearchInd: Boolean,
  label: String,
  modelValue: String,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'selected', personId: string): void;
}>();
const personSearchSelect = ref<QSelect>();
const options = ref<OptionsModel[]>([]);
const model = ref(null);

function filterFn(val: string, update: any, abort: any) {
  setTimeout(() => {
    update(() => {
      if (val.length < 2) {
        options.value = [];
      } else {
        options.value = search(val.toLowerCase());
      }
    });
  }, 100);
}

function abortFilterFn() {
  // console.log('delayed filter aborted')
}

function personSelected(option: OptionsModel) {
  if (option !== null) {
    emit('update:modelValue', option.value);
    emit('selected', option.value);

    setTimeout(() => {
      personSearchSelect.value?.blur();
    }, 200);
  }
}

function search(val: string) {
  const matches = session.familyData.filter((d) =>
    d.name.toLowerCase().includes(val)
  );
  return matches.map<OptionsModel>((d) => ({
    value: d.id,
    label: d.name,
    description: getParents(d.parentId),
    icon: d.gender === 'M' ? maleIcon : femaleIcon,
  }));
}

function getParents(parentId: string) {
  const parent = session.familyData.find((p) => p.id === parentId);
  if (parent === undefined) {
    return '';
  } else {
    return `(${parent.name} - ${parent.spouseName})`;
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title shrink> Vamsam </q-toolbar-title>
        <q-space></q-space>

        <div class="row items-center">
          <q-select
            ref="personSearch"
            filled
            v-model="model"
            use-input
            clearable
            fill-input
            hide-selected
            hide-dropdown-icon
            input-debounce="2"
            label="Searh"
            :options="options"
            @filter="filterFn"
            @filter-abort="abortFilterFn"
            @update:model-value="personSelected"
            style="width: 350px"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ scope.opt.label }}
                    {{ scope.opt.description }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <q-space></q-space>
        <q-chip>
          <q-avatar color="blue" text-color="white">
            <img :src="maleIcon" />
          </q-avatar>
          Prasanna Kumar
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :show-if-above="false" bordered>
      <q-list>
        <q-item-label header> Menu Goes here </q-item-label>

        <!-- <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        /> -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
.q-field__label
  color: white
</style>

<script setup lang="ts">
import { ref } from 'vue';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';
import familyData from 'src/services/family-data.json';
import { OptionsModel } from 'src/models/quasar-models';
import { QSelect } from 'quasar';

// import EssentialLink, {
//   EssentialLinkProps,
// } from 'components/EssentialLink.vue';

// const essentialLinks: EssentialLinkProps[] = [
//   {
//     title: 'Docs',
//     caption: 'quasar.dev',
//     icon: 'school',
//     link: 'https://quasar.dev',
//   },
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework',
//   },
//   {
//     title: 'Discord Chat Channel',
//     caption: 'chat.quasar.dev',
//     icon: 'chat',
//     link: 'https://chat.quasar.dev',
//   },
//   {
//     title: 'Forum',
//     caption: 'forum.quasar.dev',
//     icon: 'record_voice_over',
//     link: 'https://forum.quasar.dev',
//   },
//   {
//     title: 'Twitter',
//     caption: '@quasarframework',
//     icon: 'rss_feed',
//     link: 'https://twitter.quasar.dev',
//   },
//   {
//     title: 'Facebook',
//     caption: '@QuasarFramework',
//     icon: 'public',
//     link: 'https://facebook.quasar.dev',
//   },
//   {
//     title: 'Quasar Awesome',
//     caption: 'Community Quasar projects',
//     icon: 'favorite',
//     link: 'https://awesome.quasar.dev',
//   },
// ];

const options = ref<OptionsModel[]>([]);
const model = ref(null);
const personSearch = ref<QSelect>();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function filterFn(val: string, update, abort) {
  setTimeout(() => {
    update(() => {
      if (val.length < 2) {
        options.value = [];
      } else {
        options.value = search(val.toLowerCase());
      }
    });
  }, 500);
}

function abortFilterFn() {
  // console.log('delayed filter aborted')
}

function personSelected(val: OptionsModel) {
  // console.log(val);
  // // console.log(personSearch.value.target);
  // console.log(personSearch.value.$refs);
  // personSearch.value.$nextTick(() => {
  //   // Remove focus from the input element
  //   personSearch.value.$refs.input.blur();
  //});
  //personSearch.value.blur();
  // personSearch.value.$refs.input.blur();
}

function search(val: string) {
  const matches = familyData.filter((d) => d.name.toLowerCase().includes(val));
  return matches.map<OptionsModel>((d) => ({
    value: d.id,
    label: d.name,
    description: getParents(d.parentId),
    icon: 'mail',
  }));
}

function getParents(parentId: string) {
  const parent = familyData.find((p) => p.id === parentId);
  if (parent === undefined) {
    return '';
  } else {
    return `(${parent.name} - ${parent.spouseName})`;
  }
}
</script>

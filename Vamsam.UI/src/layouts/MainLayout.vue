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
            ref="personSearchSelect"
            filled
            v-model="model"
            use-input
            clearable
            fill-input
            hide-selected
            hide-dropdown-icon
            input-debounce="2"
            label="Search"
            dark
            dense
            :options="options"
            @filter="filterFn"
            @filter-abort="abortFilterFn"
            @update:model-value="personSelected"
            style="width: 350px"
          >
            <template v-slot:prepend>
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
                    <div style="font-size: 1.5em">{{ scope.opt.label }}</div>
                    <div>{{ scope.opt.description }}</div>
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

<!-- <style lang="sass">
.q-field__label
  color: white
</style> -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';
import familyData from 'src/services/family-data.json';
import { OptionsModel } from 'src/models/quasar-models';
import { QSelect } from 'quasar';
import session from 'src/services/session';

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
const personSearchSelect = ref<QSelect>();
const leftDrawerOpen = ref(false);

onMounted(() => {
  //console.log(personSearchSelect.value.$refs);
});

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

function personSelected(option: OptionsModel) {
  if (option !== null) {
    session.searchPersonId.value = option.value;
    setTimeout(() => {
      personSearchSelect.value?.blur();
    }, 500);
  }

  // console.log(val);
  // // console.log(personSearchSelect.value.target);
  // console.log(personSearchSelect.value.$refs);
  // personSearchSelect.value.$nextTick(() => {
  //   // Remove focus from the input element
  //   personSearchSelect.value.$refs.input.blur();
  //});
  //personSearchSelect.value.blur();
  // personSearchSelect.value.$refs.input.blur();
}

function search(val: string) {
  const matches = familyData.filter((d) => d.name.toLowerCase().includes(val));
  return matches.map<OptionsModel>((d) => ({
    value: d.id,
    label: d.name,
    description: getParents(d.parentId),
    icon: d.gender === 'M' ? maleIcon : femaleIcon,
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

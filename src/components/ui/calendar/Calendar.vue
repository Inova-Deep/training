<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps, DateValue } from 'reka-ui'
import type { HTMLAttributes, Ref } from 'vue'
import type { LayoutTypes } from '.'
import { getLocalTimeZone, today } from '@internationalized/date'
import { createReusableTemplate, reactiveOmit, useVModel } from '@vueuse/core'
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from 'reka-ui'
import { createYear, createYearRange, toDate } from 'reka-ui/date'
import { computed, toRaw, ref, nextTick } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-vue-next'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNextButton,
  CalendarPrevButton,
} from '.'

const props = withDefaults(
  defineProps<
    CalendarRootProps & {
      class?: HTMLAttributes['class']
      layout?: LayoutTypes
      yearRange?: DateValue[]
    }
  >(),
  {
    modelValue: undefined,
    layout: undefined,
  },
)
const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'layout', 'placeholder')

const placeholder = useVModel(props, 'placeholder', emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>

const formatter = useDateFormatter(props.locale ?? 'en')

const yearRange = computed(() => {
  return (
    props.yearRange ??
    createYearRange({
      start:
        props?.minValue ??
        (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
          'year',
          -100,
        ),

      end:
        props?.maxValue ??
        (toRaw(props.placeholder) ?? props.defaultPlaceholder ?? today(getLocalTimeZone())).cycle(
          'year',
          10,
        ),
    })
  )
})

const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{ date: DateValue }>()
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{ date: DateValue }>()

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const monthDropdownOpen = ref(false)
const yearDropdownOpen = ref(false)
const yearDropdownEl = ref<HTMLElement | null>(null)

function openYearDropdown() {
  yearDropdownOpen.value = !yearDropdownOpen.value
  monthDropdownOpen.value = false
  if (yearDropdownOpen.value) {
    nextTick(() => {
      const active = yearDropdownEl.value?.querySelector(
        '.cal-dd-item--active',
      ) as HTMLElement | null
      active?.scrollIntoView({ block: 'center' })
    })
  }
}
</script>

<template>
  <DefineMonthTemplate v-slot="{ date }">
    <div class="cal-dd-wrap">
      <button
        type="button"
        class="cal-dd-btn"
        @click.stop="monthDropdownOpen = !monthDropdownOpen; yearDropdownOpen = false"
      >
        {{ formatter.custom(toDate(date), { month: 'short' }) }}
        <ChevronDown class="cal-dd-chevron" />
      </button>
      <div v-show="monthDropdownOpen" class="cal-dd-list">
        <button
          v-for="month in createYear({ dateObj: date })"
          :key="month.toString()"
          type="button"
          class="cal-dd-item"
          :class="{ 'cal-dd-item--active': date.month === month.month }"
          @click.stop="placeholder = placeholder.set({ month: month.month }); monthDropdownOpen = false"
        >
          {{ formatter.custom(toDate(month), { month: 'short' }) }}
        </button>
      </div>
    </div>
  </DefineMonthTemplate>

  <DefineYearTemplate v-slot="{ date }">
    <div class="cal-dd-wrap">
      <button type="button" class="cal-dd-btn" @click.stop="openYearDropdown">
        {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
        <ChevronDown class="cal-dd-chevron" />
      </button>
      <div
        v-show="yearDropdownOpen"
        class="cal-dd-list cal-dd-list--year"
        :ref="
          (el) => {
            yearDropdownEl = el as HTMLElement | null
          }
        "
      >
        <button
          v-for="year in yearRange"
          :key="year.toString()"
          type="button"
          class="cal-dd-item"
          :class="{ 'cal-dd-item--active': date.year === year.year }"
          @click.stop="placeholder = placeholder.set({ year: year.year }); yearDropdownOpen = false"
        >
          {{ formatter.custom(toDate(year), { year: 'numeric' }) }}
        </button>
      </div>
    </div>
  </DefineYearTemplate>

  <CalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-bind="forwarded"
    v-model:placeholder="placeholder"
    data-slot="calendar"
    :class="cn('p-3', props.class)"
    @click="monthDropdownOpen = false; yearDropdownOpen = false"
  >
    <CalendarHeader class="pt-0" @click.stop>
      <nav class="flex items-center gap-1 absolute top-0 inset-x-0 justify-between">
        <CalendarPrevButton>
          <slot name="calendar-prev-icon" />
        </CalendarPrevButton>
        <CalendarNextButton>
          <slot name="calendar-next-icon" />
        </CalendarNextButton>
      </nav>

      <slot
        name="calendar-heading"
        :date="date"
        :month="ReuseMonthTemplate"
        :year="ReuseYearTemplate"
      >
        <template v-if="layout === 'month-and-year'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else-if="layout === 'month-only'">
          <div class="flex items-center justify-center gap-1">
            <ReuseMonthTemplate :date="date" />
            {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
          </div>
        </template>
        <template v-else-if="layout === 'year-only'">
          <div class="flex items-center justify-center gap-1">
            {{ formatter.custom(toDate(date), { month: 'short' }) }}
            <ReuseYearTemplate :date="date" />
          </div>
        </template>
        <template v-else>
          <CalendarHeading />
        </template>
      </slot>
    </CalendarHeader>

    <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()">
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell v-for="day in weekDays" :key="day">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 w-full"
          >
            <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
              <CalendarCellTrigger :day="weekDate" :month="month.value" />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>

<style scoped>
.cal-dd-wrap {
  position: relative;
}

.cal-dd-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 28px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle, oklch(0.88 0.01 255));
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-heading);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cal-dd-btn:hover {
  background: var(--bg-subtle);
}

.cal-dd-chevron {
  width: 11px;
  height: 11px;
  opacity: 0.5;
}

.cal-dd-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--bg-surface);
  border: 1px solid oklch(0.88 0.01 255);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  display: flex;
  flex-direction: column;
  min-width: 88px;
}

.cal-dd-list--year {
  max-height: 200px;
  overflow-y: auto;
}

.cal-dd-item {
  display: block;
  width: 100%;
  padding: 5px 10px;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  color: var(--text-body);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.1s ease;
  white-space: nowrap;
}

.cal-dd-item:hover {
  background: var(--bg-subtle);
}

.cal-dd-item--active {
  background: var(--brand-primary);
  color: #fff;
  font-weight: 500;
}

.cal-dd-item--active:hover {
  background: var(--brand-primary);
  opacity: 0.9;
}
</style>

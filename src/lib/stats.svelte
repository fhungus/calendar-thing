<script lang="ts">
    import { Schoolyear } from "$lib/schoolyear";

    interface Props {
        schoolyear: Schoolyear,
        today: Temporal.PlainDate,
        schooldays: Temporal.PlainDate[],
        holidays: Temporal.PlainDate[],
    }
    let {today, schoolyear, schooldays, holidays}: Props = $props();

    const days_passed = schoolyear.days_passed(schooldays, today);
    const hours_passed = (7 * days_passed) - ((days_passed % 5) * 2.5)

    const days_remaining = schoolyear.days_remaining(schooldays, today);
    const hours_remaining = (7 * days_remaining) - ((days_remaining % 5) * 2.5)
</script>

<div class="stats-outer">

    <b class="accenttext">{days_passed}</b> days have passed <br/>
    <b class="accenttext">{hours_passed}</b> hours spent

    <div class="longline"></div>

    <b>{days_remaining}</b> days remain <br/>
    <b>{Math.floor(hours_remaining)}</b> hours to go
</div>

<style>
    .stats-outer {
        padding-top: .7em;
    }

    .accenttext {
        color: var(--accent);
    }

    .longline {
        background-color: var(--border);

        width: calc(100% - .5em);
        height: 2px;

        margin: 1.5em 0.25em;
    }
</style>
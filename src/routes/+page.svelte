<script lang="ts">
    import { default_schoolyear, start_date_def, end_date_def } from "$lib/schoolyear";
    import Visualizer from "$lib/visualizer.svelte";
    import Stats from "$lib/stats.svelte";

    // schoolday
    const today = Temporal.PlainDate.from("2026-12-03");
    //const today = Temporal.Now.plainDateISO();
    let schoolyear = default_schoolyear(today, start_date_def, end_date_def);
    let schooldays = schoolyear.get_list_of_days();
    let holidays = schoolyear.get_holidays();
</script>

<div class="takeupscreen">
<div class="surrounding">
    <div class="visualizer-card bordered">
        <Visualizer today={today} schooldays={schooldays} schoolyear={schoolyear} holidays={holidays}/>
    </div>
    <div class="stat-container">
        <Stats today={today} schooldays={schooldays} schoolyear={schoolyear} holidays={holidays}/>
    </div>
</div>
</div>

<style>
    :global(body) {
        --bg:     #EAEAF0;
        --bg1:    #EFEFF5;
        --fg:     #1b1c1d;
        --border: #b9bcce;
        --accent: #455ec3;

        --vis-today: rgb(23, 23, 54);
        --vis-next:  #AEAEB5;
        --vis-holiday: #DFDFE2;

        color: var(--fg);
    }

    @media (prefers-color-scheme: dark) {
        :global(body) {
            --bg:     #08080b;
            --bg1:    #13131a;
            --fg:     #bdc9d5;
            --border: #272632;
            --accent: #6e84de;

            --vis-today: rgb(111, 140, 209);
            --vis-next:  #323340;
            --vis-holiday: rgb(29, 29, 36);

            color: var(--fg);
        }
    }

    .surrounding {
        display: flex;

        align-content: center;
        justify-content: center;

        column-gap: 1.75em;
    }

    .takeupscreen {
        width: 100vw;
        height: 100vh;

        align-content: center;
        justify-content: center;
    }

    .visualizer-card {
        background-color: var(--bg1);
        padding: 10px;
    }

    .bordered {
        border: 2px solid;
        border-radius: 5px;
        border-color: var(--border);
    }

</style>
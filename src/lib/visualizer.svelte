<script lang="ts">
    import { Schoolyear } from "$lib/schoolyear";
    import { onMount } from "svelte";
    import { cloudsShader } from "./visualizer-shader";

    import 'tippy.js/dist/tippy.css';

    let outer: HTMLDivElement | undefined = $state();
    let width = $state(0);

    interface Props {
        schoolyear: Schoolyear,
        today: Temporal.PlainDate,
        schooldays: Temporal.PlainDate[],
        holidays: Temporal.PlainDate[],
    }
    let {today, schoolyear, schooldays, holidays}: Props = $props();

    let time = $state(0);

    // size & coordinate related things...
    const endx = 5;
    const {y: endy, x: _} = schoolyear.get_xy(schoolyear.end_date);

    let size = $derived(width ? width / (endx) : 20);

    $effect(() => {
        if (!outer) return;
        const ro = new ResizeObserver(([entry]) => {
            width = entry.contentRect.width;
        });
        ro.observe(outer);
        return () => ro.disconnect();
    });

    // Horrifying timer for the stupid shader
    onMount(() => {
        let d: number | undefined;

        let tm: Function;
        tm = () => {
            time += .1;
            d = setTimeout(tm, 100);
        }
        tm()

        return () => {
            clearTimeout(d);
        }
    });

    // function tooltip(node: MultipleTargets, params: Partial<Props>) {
    //     let tip = tippy(node, params);
    //     return {
    //         update: (newParams) => {
    //             tip.setProps(newParams);
    //         },
    //         destroy: () => {
    //             tip.destroy()
    //         }
    //     }
    // }
</script>

<div class="calendar-outer">
    <div class="days-list">
        {#each ["M", "T", "W", "T", "F"] as text}
            <div style={`width: ${size}px; height: ${size}px;`}>{text}</div>
        {/each} 
    </div>
    <div class="progress" bind:this={outer} style={`height: ${size*(endy+1)}px`}>
        {#each schooldays as d}
            {@const cmp = Temporal.PlainDate.compare(today, d)}
            {@const {x, y} = schoolyear.get_xy(d)}

            <button 
                title={`${d.toString()}`} 
                id={`cal${d.dayOfYear}`} 
                class="calendar-day" 
                style={`left: ${(x*size)+1}px; top: ${(y*size)+1}px; width: ${size-3}px; height: ${size-3}px; background-color: ${
                    cmp == 1 ? (()=> {
                        const [r, g, b, a] = cloudsShader(x, y, endx, endy, time);
                        return `rgba(${r*255}, ${g*255}, ${b*255}, ${a*255})`
                    })() : 
                    cmp == 0 ? "var(--vis-today)" : "var(--vis-next)"};`}
            ></button>
        {/each}
        {#each holidays as d}
            {@const {x, y} = schoolyear.get_xy(d)}
            <div class="calendar-day holiday" style={`left: ${(x*size)+5}px; top: ${(y*size)+5}px; width: ${size-10}px; height: ${size-10}px;`}></div>
        {/each}
    </div>
</div>

<style>
    .progress {
        width: 7em;
        position: relative;
    }

    .calendar-outer {
        display: flex;
        flex-direction: column;
        text-align: center;
    }

    .days-list {
        display: flex;
        justify-content: space-between;
    }

    .calendar-day {
        border-style: none;
        position: absolute;
    }

    .holiday {
        background-color: var(--vis-holiday);
        border-radius: 50%;
    }
</style>

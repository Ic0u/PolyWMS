<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    show = false,
    title = "",
    onclose,
    children,
    wide = false,
  }: {
    show: boolean;
    title: string;
    onclose: () => void;
    children: Snippet;
    wide?: boolean;
  } = $props();
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="modal-overlay"
    onclick={(e) => {
      if (e.target === e.currentTarget) onclose();
    }}
  >
    <div class="modal-tahoe-glass" class:wide>
      {#if title}<h2 class="tahoe-title">{title}</h2>{/if}
      <div class="tahoe-content">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    /* Soft dim behind the active liquid glass pane */
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeInOverlay 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-tahoe-glass {
    width: 100%;
    max-width: 440px;
    /* Tahoe Liquid UI / VisionOS styling */
    background: rgba(45, 45, 50, 0.55);
    backdrop-filter: blur(60px) saturate(160%);
    -webkit-backdrop-filter: blur(60px) saturate(160%);
    border-radius: 24px;
    /* Clean frosted line and dynamic light bevel */
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 1px 1.5px rgba(255, 255, 255, 0.25),
      /* Liquid top specular rim */ inset 0 -1px 1.5px rgba(0, 0, 0, 0.4),
      /* Recessed bottom inner curve */ 0 40px 80px rgba(0, 0, 0, 0.8),
      /* Deep 3D drop shadow */ 0 0 0 1px rgba(0, 0, 0, 0.3); /* Sharp crisp black outer edge */
    display: flex;
    flex-direction: column;
    animation: liquidPop 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center;
    overflow: hidden;
  }
  .modal-tahoe-glass.wide {
    max-width: 680px;
  }

  .tahoe-title {
    font-size: 17px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 28px 28px 16px;
    letter-spacing: -0.01em;
    font-family: var(--font);
    text-align: center;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .tahoe-content {
    padding: 0 28px 28px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    text-align: left;
    line-height: 1.5;
    font-family: var(--font);
    font-weight: 400;
  }

  /* Modal action buttons row */
  .tahoe-content :global(.modal-actions) {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 0.5px solid rgba(255, 255, 255, 0.08);
  }
  :global(html.light) .tahoe-content :global(.modal-actions) {
    border-top-color: rgba(0, 0, 0, 0.06);
  }

  @keyframes fadeInOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes liquidPop {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(30px);
      filter: blur(4px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
      filter: blur(0);
    }
  }

  /* Light mode modal — clean white Apple sheet */
  :global(html.light) .modal-overlay {
    background: rgba(0, 0, 0, 0.25);
  }
  :global(html.light) .modal-tahoe-glass {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(60px) saturate(200%);
    -webkit-backdrop-filter: blur(60px) saturate(200%);
    border: 0.5px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.8),
      inset 0 -0.5px 1px rgba(0, 0, 0, 0.08),
      0 24px 80px rgba(0, 0, 0, 0.18),
      0 0 0 0.5px rgba(0, 0, 0, 0.04);
  }
  :global(html.light) .tahoe-title {
    color: #1d1d1f;
    text-shadow: none;
  }
  :global(html.light) .tahoe-content {
    color: #424245;
  }

  @media (max-width: 480px) {
    .modal-tahoe-glass,
    :global(html.light) .modal-tahoe-glass {
      border-radius: 18px;
    }
    .modal-overlay {
      padding: 16px;
    }
    .tahoe-title {
      font-size: 15px;
      margin: 20px 20px 12px;
    }
    .tahoe-content {
      padding: 0 20px 20px;
    }
  }
</style>

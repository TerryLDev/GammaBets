<template>
  <div id="spinner-area" class="primary-color default-cell accent-color">
    <div class="top-spinner-area">
      <div
        id="jp-total-amount"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 id="jp-total-amount-text" class="top-spinner-area-h">$0.00</h2>
        <p class="top-spinner-area-t">Total Amount:</p>
      </div>
      <!-- If anyone is ready this, this timer was a pain in the ass to make -->
      <div id="jp-timer">
        <div class="jp-timer-border"></div>
        <svg
          id="svg-circle"
          width="100"
          height="100"
          style="transform: rotate(-90deg) scaleY(-1)"
        >
          <circle
            id="jp-timer-circle"
            cx="50"
            cy="50"
            r="45"
            stroke="white"
            stroke-width="9"
            stroke-dasharray="283"
            stroke-offset="283"
            fill="none"
          />
        </svg>
        <p id="jp-current-time">120</p>
      </div>
      <div
        id="jp-total-item"
        class="secondary-color default-secondary-cell accent-color"
      >
        <h2 class="top-spinner-area-h">
          <span id="jp-total-item-text">0</span>/100
        </h2>
        <p class="top-spinner-area-t">Total Items:</p>
      </div>
    </div>

    <button
      id="jp-deposit"
      class="secondary-color default-secondary-cell accent-color"
    >
      Deposit
    </button>
    <script></script>
  </div>
</template>

<script>
export default {};
</script>

<style></style>

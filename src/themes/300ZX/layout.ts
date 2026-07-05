/**
 * Markup for the 300ZX theme, split out from the theme logic so it's easier to
 * read and edit.
 *
 * `html` is just `String.raw` — it doesn't transform anything at runtime, but
 * editors with a lit-html / "es6-string-html" extension will syntax-highlight
 * the tagged template below.
 */
const html = String.raw;

/** SVG icon markup the layout needs, injected so this file stays dependency-free. */
export interface LayoutIcons {
  fuel: string;
  coolant: string;
  oilPressure: string;
  battery: string;
}

export function dashboardLayout(icons: LayoutIcons): string {
  return html`
    <div class="container">
      <div class="row row-top">
        <turn-signal direction="left"></turn-signal>
        <div class="readout readout-speed">
          <span class="value" id="speed-val">000</span> <label>mph</label>
        </div>
        <div class="readout readout-gps">
          <span class="value" id="gps-val">0.00000, 0.00000</span>
        </div>
        <turn-signal direction="right"></turn-signal>
      </div>

      <div class="row">
        <div class="gauge-group">
          <div class="gauge-group-header">
            <span></span>
            <div class="gauge-group-header-icon">
              <span id="fuel-alert" class="alert"></span>
              ${icons.fuel}
            </div>
            <span></span>
          </div>
          <div class="gauge-group-body">
            <pip-gauge
              id="tps-gauge"
              min="0"
              max="100"
              legend="100%,,,,0%"
            ></pip-gauge>
            <pip-gauge
              id="fuel-gauge"
              min="0"
              max="100"
              legend="F,,½,,E"
            ></pip-gauge>
            <pip-gauge
              id="afr-gauge"
              min="10"
              max="18"
              legend="18,17,16,15,14,13,12,11"
            ></pip-gauge>
          </div>
          <div class="gauge-group-footer">
            <label>TPS</label>
            <label>Fuel</label>
            <label>AFR</label>
          </div>
        </div>

        <div class="gauge-group">
          <div class="readout-group readout-rpm">
            <div class="readout">
              <span class="value" id="rpm-val">0000</span>
            </div>
            <label>x100r/min</label>
          </div>
          <div class="readout readout-tach"></div>
          <div class="gauge-group-footer"><label>Tach</label></div>
        </div>

        <div class="gauge-group">
          <div class="gauge-group-header">
            <div class="gauge-group-header-icon">
              <span id="coolant-alert" class="alert"></span>
              ${icons.coolant}
            </div>
            <div class="gauge-group-header-icon">
              <span id="oil-pressure-alert" class="alert"></span>
              ${icons.oilPressure}
            </div>
            <div class="gauge-group-header-icon">
              <span id="battery-alert" class="alert"></span>
              ${icons.battery}
            </div>
          </div>
          <div class="gauge-group-body">
            <pip-gauge
              id="coolant-gauge"
              min="120"
              max="270"
              legend="270º,,120º"
            ></pip-gauge>
            <pip-gauge
              id="oil-pressure-gauge"
              min="0"
              max="90"
              legend="90,45,0"
            ></pip-gauge>
            <pip-gauge
              id="battery-gauge"
              min="10"
              max="16"
              legend="16,13,10"
            ></pip-gauge>
          </div>
          <div class="gauge-group-footer">
            <label>ºF</label>
            <label>lb/in<sup>2</sup></label>
            <label>V</label>
          </div>
        </div>
      </div>
    </div>
  `;
}

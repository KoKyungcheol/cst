export default `<div class="settings js-settings">
  <div class="settings-toggle js-settings-toggle">
    <i class="align-middle" data-feather="more-vertical"></i>
  </div>
  <div class="settings">
    <div class="settings-panel">
      <div class="settings-content">
        <div class="settings-title">
          <button type="button" class="btn-close btn-close-white btn-close-custom float-end js-settings-toggle" aria-label="Close">
            <i className="align-middle" data-feather="x"></i>
          </button>
          <h4 class="mb-0 d-inline-block">Settings</h4>
          
        </div>

        <div class="settings-options">

          <div class="mb-3">
            <small class="d-block text-uppercase font-weight-bold text-muted mb-2">Menu layout</small>
            <div class="form-check form-switch mb-1">
              <input type="radio" class="form-check-input settings-radio" name="sidebarLayout" value="default" id="sidebarDefault" checked>
              <label class="form-check-label" for="sidebarDefault">Default</label>
            </div>
            <div class="form-check form-switch mb-1 menulayout-compact">
              <input type="radio" class="form-check-input settings-radio" name="sidebarLayout" value="compact" id="sidebarCompact">
              <label class="form-check-label" for="sidebarCompact">Compact</label>
            </div>
          </div>

          <hr>

          <div class="mb-3">
          <small class="d-block text-uppercase font-weight-bold text-muted mb-2">Menu Type</small>
          <div class="form-check form-switch mb-1">
            <input type="radio" class="form-check-input settings-radio" name="menuType" value="defaultMenu" id="defaultMenu" checked>
            <label class="form-check-label" for="defaultMenu">Default Menu</label>
          </div>
          <div class="form-check form-switch mb-1 menutype-top">
            <input type="radio" class="form-check-input settings-radio" name="menuType" value="topMenu" id="topMenu">
            <label class="form-check-label" for="topMenu">Top Menu</label>
          </div>
        </div>

          <div class="mb-3">
            <a class="btn btn-outline-primary btn-lg js-settings-reset">Reset to Default</a>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>`
(function() {
  var PilotRow, UpgradeSelector, exportObj,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

  exportObj.sortHelper = function(a, b) {
    a = a.name.replace(/[^a-z0-9]/ig, '');
    b = b.name.replace(/[^a-z0-9]/ig, '');
    if (a === b) {
      return 0;
    } else {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    }
  };

  exportObj.SquadBuilder = (function() {

    function SquadBuilder(args) {
      var _this = this;
      this.container = $(args.container);
      this.faction = args.faction;
      this.rows = [];
      this.pilots = [];
      this.unique_upgrades = [];
      this.rows.push(new PilotRow(this));
      this.rows.push(new PilotRow(this));
      this.rows.push(new PilotRow(this));
      $(window).bind('xwing:pilotChanged', function(e, triggering_row) {
        var row, _i, _len, _ref, _results;
        _this.pilots = (function() {
          var _i, _len, _ref, _results;
          _ref = this.rows;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            if ((row.name != null) && row.name !== '') _results.push(row.name);
          }
          return _results;
        }).call(_this);
        _ref = _this.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          if (row !== triggering_row) {
            _results.push(row.update());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      $(window).bind('xwing:upgradeChanged', function(e, triggering_selector) {
        var row, selector, upgrade, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _results;
        _this.unique_upgrades = [];
        _ref = _this.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _ref2 = (function() {
            var _k, _len2, _ref2, _results;
            _ref2 = row.upgrade_selectors;
            _results = [];
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              selector = _ref2[_k];
              _results.push(selector.upgrade);
            }
            return _results;
          })();
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            upgrade = _ref2[_j];
            if ((upgrade != null ? upgrade.unique : void 0) != null) {
              _this.unique_upgrades.push(selector.upgrade_name);
            }
          }
        }
        _ref3 = _this.rows;
        _results = [];
        for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
          row = _ref3[_k];
          _results.push((function() {
            var _l, _len4, _ref4, _results2;
            _ref4 = row.upgrade_selectors;
            _results2 = [];
            for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
              selector = _ref4[_l];
              if (selector !== triggering_selector) {
                _results2.push(selector.update());
              } else {
                _results2.push(void 0);
              }
            }
            return _results2;
          })());
        }
        return _results;
      });
    }

    SquadBuilder.prototype.getAvailablePilots = function() {
      var pilot_data, pilot_name, ship_data, ship_name, ships, _ref, _ref2, _results;
      ships = (function() {
        var _ref, _results;
        _ref = exportObj.ships;
        _results = [];
        for (ship_name in _ref) {
          ship_data = _ref[ship_name];
          if (ship_data.faction === this.faction) _results.push(ship_name);
        }
        return _results;
      }).call(this);
      _ref = exportObj.pilots;
      _results = [];
      for (pilot_name in _ref) {
        pilot_data = _ref[pilot_name];
        if ((_ref2 = pilot_data.ship, __indexOf.call(ships, _ref2) >= 0) && (!(pilot_data.unique != null) || __indexOf.call(this.pilots, pilot_name) < 0)) {
          _results.push({
            name: pilot_name,
            points: pilot_data.points
          });
        }
      }
      return _results;
    };

    SquadBuilder.prototype.getAvailableUpgrades = function(slot) {
      var upgrade_data, upgrade_name;
      return ((function() {
        var _ref, _results;
        _ref = exportObj.upgrades;
        _results = [];
        for (upgrade_name in _ref) {
          upgrade_data = _ref[upgrade_name];
          if (upgrade_data.slot === slot && __indexOf.call(this.unique_upgrades, upgrade_name) < 0) {
            _results.push({
              name: upgrade_name,
              points: upgrade_data.points
            });
          }
        }
        return _results;
      }).call(this)).sort(exportObj.sortHelper);
    };

    return SquadBuilder;

  })();

  PilotRow = (function() {

    function PilotRow(builder) {
      var _this = this;
      this.builder = builder;
      this.name = null;
      this.pilot = null;
      this.ship = null;
      this.upgrade_selectors = [];
      this.row = $(document.createElement('DIV'));
      this.row.addClass('row');
      this.builder.container.append(this.row);
      this.pilot_cell = $(document.createElement('DIV'));
      this.pilot_cell.addClass('four columns');
      this.row.append(this.pilot_cell);
      this.pilot_selector = $(document.createElement('SELECT'));
      this.pilot_selector.append($(document.createElement('OPTION')));
      this.pilot_selector.addClass('pilot');
      this.pilot_selector.attr('data-placeholder', 'Select a pilot');
      this.pilot_selector.change(function(e) {
        var slot, _i, _len, _ref;
        _this.upgrade_selectors = [];
        _this.name = _this.pilot_selector.val();
        if (_this.name === '') {
          _this.pilot = null;
          _this.ship = null;
          _this.upgrade_cell.text('Select a pilot to view upgrades');
        } else {
          _this.upgrade_cell.text('');
          _this.pilot = exportObj.pilots[_this.name];
          _this.ship = exportObj.ships[_this.pilot.ship];
          _ref = _this.pilot.slots;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            slot = _ref[_i];
            _this.upgrade_selectors.push(new UpgradeSelector(_this.builder, slot, _this.upgrade_cell));
          }
        }
        return $(window).trigger('xwing:pilotChanged', _this);
      });
      this.pilot_cell.append(this.pilot_selector);
      this.pilot_selector.chosen({
        allow_single_deselect: true
      });
      this.upgrade_cell = $(document.createElement('DIV'));
      this.upgrade_cell.addClass('eight columns upgrades');
      this.row.append(this.upgrade_cell);
      this.update();
      this.pilot_selector.change();
    }

    PilotRow.prototype.update = function() {
      var available_pilots, option, pilot, _i, _len;
      available_pilots = this.builder.getAvailablePilots();
      if (this.pilot) {
        available_pilots.push({
          name: this.name,
          points: this.pilot.points
        });
      }
      available_pilots.sort(exportObj.sortHelper);
      this.pilot_selector.text('');
      this.pilot_selector.append(document.createElement('OPTION'));
      for (_i = 0, _len = available_pilots.length; _i < _len; _i++) {
        pilot = available_pilots[_i];
        option = $(document.createElement('OPTION'));
        option.text("" + pilot.name + " (" + pilot.points + ")");
        option.val(pilot.name);
        this.pilot_selector.append(option);
      }
      this.pilot_selector.val(this.name);
      return this.pilot_selector.trigger('liszt:updated');
    };

    return PilotRow;

  })();

  UpgradeSelector = (function() {

    function UpgradeSelector(builder, slot, container) {
      var _this = this;
      this.builder = builder;
      this.slot = slot;
      this.upgrade_name = null;
      this.upgrade = null;
      this.selector = $(document.createElement('SELECT'));
      this.selector.append($(document.createElement('OPTION')));
      this.selector.addClass('upgrade');
      this.selector.attr('data-placeholder', "Select " + this.slot + " Upgrade");
      this.selector.change(function(e) {
        _this.upgrade_name = _this.selector.val();
        _this.upgrade = exportObj.upgrades[_this.selector.val()];
        return $(window).trigger('xwing:upgradeChanged', _this.selector);
      });
      container.append(this.selector);
      this.selector.chosen({
        allow_single_deselect: true
      });
      this.update();
      this.selector.change();
    }

    UpgradeSelector.prototype.update = function() {
      var available_upgrades, option, upgrade, _i, _len;
      available_upgrades = this.builder.getAvailableUpgrades(this.slot);
      if (this.upgrade && (this.upgrade.unique != null)) {
        available_upgrades.push({
          name: this.upgrade_name,
          points: this.upgrade.points
        });
      }
      available_upgrades.sort(exportObj.sortHelper);
      this.selector.text('');
      this.selector.append(document.createElement('OPTION'));
      for (_i = 0, _len = available_upgrades.length; _i < _len; _i++) {
        upgrade = available_upgrades[_i];
        option = $(document.createElement('OPTION'));
        option.text("" + upgrade.name + " (" + upgrade.points + ")");
        option.val(upgrade.name);
        this.selector.append(option);
      }
      this.selector.val(this.upgrade_name);
      return this.selector.trigger('liszt:updated');
    };

    return UpgradeSelector;

  })();

}).call(this);

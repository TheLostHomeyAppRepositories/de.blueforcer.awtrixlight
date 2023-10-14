'use strict';

const { Driver } = require('homey');
const AwtrixClient = require('../../lib/AwtrixClient');
const AwtrixResponses = require('../../lib/AwtrixClientResponses');

class UlanziAwtrix extends Driver {

  static ENABLE_MANUAL_ADD = false;

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  async initFlows() {
    // Register flows
    this._notificationTextAction = this.homey.flow.getActionCard('notificationText');
    this._notificationDismissAction = this.homey.flow.getActionCard('notificationDismiss');
    this._showDisplySetAction = this.homey.flow.getActionCard('displaySet');

    // Notification flows
    this._notificationTextAction.registerRunListener(async (args, state) => {
      this.log('action:notificationText', args, state);
      args.device.api.notify(args.msg, { color: args.color ?? null, duration: args.duration });
    });
    this._notificationDismissAction.registerRunListener(async (args, state) => {
      this.log('action:notificationDismiss', args, state);
      args.device.api.dismiss();
    });

    // App flows
    //TODO: implement app flows

    // Display flows
    this._showDisplySetAction.registerRunListener(async (args, state) => {
      this.log('action:displaySet', args, state);
      args.device.api.power(args.power === '1');
    });
  }

  async onPair(session) {
    this.log('onPair', session);

    session.setHandler('list_devices', async () => {
      const discoveryStrategy = this.getDiscoveryStrategy();
      const discoveryResults = discoveryStrategy.getDiscoveryResults();

      this.log(discoveryResults);

      const devices = Object.values(discoveryResults).map((discoveryResult) => {
        return {
          name: discoveryResult.id,
          data: {
            id: discoveryResult.id,
          },
          store: {
            address: discoveryResult.address,
          },
          settings: {
            user: null,
            pass: null,
          },
        };
      });

      // If we do not find device, push custom one so user can set IP directly
      if (UlanziAwtrix.ENABLE_MANUAL_ADD) {
        devices.push({
          name: 'Manual',
          data: {
            id: `custom_${Date.now().toString()}`,
          },
          store: {
            address: null,
          },
          settings: {
            user: null,
            pass: null,
          },
        });
      }

      this.log(devices);
      return devices;
    });
  }

}

module.exports = UlanziAwtrix;

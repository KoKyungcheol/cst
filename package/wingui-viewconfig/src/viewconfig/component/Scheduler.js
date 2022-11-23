import Component from './Component';

export default class Scheduler extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.widget = window.kendo.jQuery(this.element);
    this.widget.kendoScheduler({
      date: new Date(),
      startTime: new Date(),
      height: 650,
      views: [
        'day',
        'workWeek',
        'week',
        {
          type: 'month',
          selected: true
        },
        'agenda',
        {
          type: 'timeline',
          eventHeight: 50
        }
      ],
      timezone: 'Etc/UTC',
      dataSource: {
        batch: true,
        transport: {
          read: {
            url: '',
            dataType: 'jsonp'
          },
          update: {
            url: '',
            dataType: 'jsonp'
          },
          create: {
            url: '',
            dataType: 'jsonp'
          },
          destroy: {
            url: '',
            dataType: 'jsonp'
          },
          parameterMap: function (options, operation) {
            if (operation !== 'read' && options.models) {
              return { models: kendo.stringify(options.models) };
            }
          }
        },
        schema: {
          model: {
            id: 'taskId',
            fields: {
              taskId: {
                from: 'TaskID',
                type: 'number'
              },
              title: {
                from: 'Title',
                defaultValue: 'No title',
                validation: {
                  required: true
                }
              },
              start: {
                type: 'date',
                from: 'Start'
              },
              end: {
                type: 'date',
                from: 'End'
              },
              startTimezone: {
                from: 'StartTimezone'
              },
              endTimezone: {
                from: 'EndTimezone'
              },
              description: {
                from: 'Description'
              },
              recurrenceId: {
                from: 'RecurrenceID'
              },
              recurrenceRule: {
                from: 'RecurrenceRule'
              },
              recurrenceException: {
                from: 'RecurrenceException'
              },
              ownerId: {
                from: 'OwnerID',
                defaultValue: 1
              },
              isAllDay: {
                type: 'boolean',
                from: 'IsAllDay'
              }
            }
          }
        },
        filter: {
          logic: 'or',
          filters: [
            {
              field: 'ownerId',
              operator: 'eq',
              value: 1
            },
            {
              field: 'ownerId',
              operator: 'eq',
              value: 2
            }
          ]
        }
      },
      resources: [
        {
          field: 'ownerId',
          title: 'Owner',
          dataSource: [
            {
              text: 'Alex',
              value: 1,
              color: '#f8a398'
            },
            {
              text: 'Bob',
              value: 2,
              color: '#51a0ed'
            },
            {
              text: 'Charlie',
              value: 3,
              color: '#56ca85'
            }
          ]
        }
      ]
    });

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let scheduler = this.widget.data('kendoScheduler');
      scheduler && scheduler.destroy();
    }
    this.destroyed();
  }
}

import React, { Component, Fragment } from 'react'
import {
  Table,
  IconArrowUp,
  IconArrowDown,
  IconShoppingCart,
  Input,
  Dropzone,
} from 'vtex.styleguide'
import faker from 'faker'
import XLSX from 'xlsx'
import { withRuntimeContext } from 'vtex.render-runtime'

const EXAMPLE_LENGTH = 100
const MOCKED_DATA = [...Array(EXAMPLE_LENGTH)].map(() => ({
  name: faker.name.findName(),
  streetAddress: faker.address.streetAddress(),
  cityStateZipAddress: `${faker.address.city()}, ${faker.address.stateAbbr()} ${faker.address.zipCode()}`,
  email: faker.internet.email().toLowerCase(),
}))

interface Props {
  runtime: any
}

class UsersTable extends Component<Props> {

  private emails: any = []

  constructor(props: any) {
    super(props)
    this.state = {
      items: MOCKED_DATA,
      tableDensity: 'low',
      searchValue: null,
      filterStatements: [],
      files: null,
      result: null
    }
    this.handleFile = this.handleFile.bind(this)
  }

  private getSchema() {
    const { tableDensity }: any = this.state

    let fontSize = 'f5'

    switch (tableDensity) {
      case 'low': {
        fontSize = 'f5'
        break
      }
      case 'medium': {
        fontSize = 'f6'
        break
      }
      case 'high': {
        fontSize = 'f7'
        break
      }
      default: {
        fontSize = 'f5'
        break
      }
    }
    return {
      properties: {
        name: {
          title: 'Name',
        },
        streetAddress: {
          title: 'Street Address',
          cellRenderer: ({ cellData }: any) => {
            return <span className="ws-normal">{cellData}</span>
          },
        },
        cityStateZipAddress: {
          title: 'City, State Zip',
          cellRenderer: ({ cellData }: any) => {
            return <span className={`ws-normal ${fontSize}`}>{cellData}</span>
          },
        },
        email: {
          title: 'Email',
          cellRenderer: ({ cellData }: any) => {
            return <span className={`ws-normal ${fontSize}`}>{cellData}</span>
          },
        },
      },
    }
  }

  private simpleInputObject({ values, onChangeObjectCallback }: any) {
    return (
      <Input
        value={values || ''}
        onChange={(e: any) => onChangeObjectCallback(e.target.value)}
      />
    )
  }

  private simpleInputVerbsAndLabel() {
    return {
      renderFilterLabel: (st: any) => {
        if (!st || !st.object) {
          // you should treat empty object cases only for alwaysVisibleFilters
          return 'Any'
        }
        return `${st.verb === '=' ? 'is' : st.verb === '!=' ? 'is not' : 'contains'
          } ${st.object}`
      },
      verbs: [
        {
          label: 'is',
          value: '=',
          object: {
            renderFn: this.simpleInputObject,
            extraParams: {},
          },
        },
        {
          label: 'is not',
          value: '!=',
          object: {
            renderFn: this.simpleInputObject,
            extraParams: {},
          },
        },
        {
          label: 'contains',
          value: 'contains',
          object: {
            renderFn: this.simpleInputObject,
            extraParams: {},
          },
        },
      ],
    }
  }

  processWb = (() => {
    const toJson = function toJson(workbook: any) {
      const result: any = {}

      workbook.SheetNames.forEach((sheetName: any) => {
        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        })

        if (roa.length) result[sheetName] = roa
      })

      return result
    }

    return (wb: any) => {
      let output: any = null

      output = toJson(wb)

      return output
    }
  })()

  private doFile([f]: any) {
    const reader: any = new FileReader()

    reader.onload = async (e: any) => {
      let data = e.target.result

      data = new Uint8Array(data)
      const result = this.processWb(XLSX.read(data, { type: 'array' }))
      const [sheetName] = Object.getOwnPropertyNames(result)

      result[sheetName].splice(0, 1)
      this.emails = result[sheetName]
      this.emails = this.emails.filter((item: any) => item.length)
      this.emails.forEach((p: any) => {
        p[0] = (p[0] || '').toString().trim()
        p[1] = (p[1] || '').toString().trim()
      })
      console.log(this.emails)
      const response = await fetch('/_v/create-gift-cards', {
        method: 'POST',
        body: JSON.stringify({
          emails: this.emails,
        })
      })
      console.log(response)
    }

    reader.onerror = () => {
      // error
    }

    reader.readAsArrayBuffer(f)
  }

  private handleFile(files: any) {
    console.log(files)
    this.doFile(files)
    this.setState({ result: files })
  }

  private handleReset(files: any) {
    if (files) {
      console.log(files)
    }
  }

  public render() {
    const {
      items,
      searchValue,
      filterStatements,
      tableDensity,
      result
    }: any = this.state
    const {
      runtime: { navigate },
    } = this.props

    return (
      <div>
        <div>
          <Dropzone
            onDropAccepted={this.handleFile}
            onFileReset={this.handleReset}
            accept=".xls,.xlsx"
          >
            <div className="pt7">
              <div>
                <span className="f4">Drop here your XLS or </span>
                <span className="f4 c-link" style={{ cursor: 'pointer' }}>
                  choose a file
                </span>
              </div>
            </div>
          </Dropzone>
          {result && (
            <div className="mt4">
              <p className="ttu f6">Result:</p>
              <pre className="bg-black-025 pa4 f7">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        <Table
          fullWidth
          updateTableKey={tableDensity}
          items={items}
          schema={this.getSchema()}
          density="low"
          onRowClick={({ rowData }: any) =>
            navigate({
              page: 'admin.app.example-detail',
              params: { id: rowData.id },
            })
          }
          toolbar={{
            density: {
              buttonLabel: 'Line density',
              lowOptionLabel: 'Low',
              mediumOptionLabel: 'Medium',
              highOptionLabel: 'High',
              handleCallback: (density: string) =>
                this.setState({ tableDensity: density }),
            },
            inputSearch: {
              value: searchValue,
              placeholder: 'Search stuff...',
              onChange: (value: string) =>
                this.setState({ searchValue: value }),
              onClear: () => this.setState({ searchValue: null }),
              onSubmit: () => { },
            },
            download: {
              label: 'Export',
              handleCallback: () => alert('Callback()'),
            },
            upload: {
              label: 'Import',
              handleCallback: () => alert('Callback()'),
            },
            fields: {
              label: 'Toggle visible fields',
              showAllLabel: 'Show All',
              hideAllLabel: 'Hide All',
            },
            extraActions: {
              label: 'More options',
              actions: [
                {
                  label: 'An action',
                  handleCallback: () => alert('An action'),
                },
                {
                  label: 'Another action',
                  handleCallback: () => alert('Another action'),
                },
                {
                  label: 'A third action',
                  handleCallback: () => alert('A third action'),
                },
              ],
            },
            newLine: {
              label: 'New',
              handleCallback: () => alert('handle new line callback'),
            },
          }}
          filters={{
            alwaysVisibleFilters: ['name', 'email'],
            statements: filterStatements,
            onChangeStatements: (newStatements: string) =>
              this.setState({ filterStatements: newStatements }),
            clearAllFiltersButtonLabel: 'Clear Filters',
            collapseLeft: true,
            options: {
              name: {
                label: 'Name',
                ...this.simpleInputVerbsAndLabel(),
              },
              email: {
                label: 'Email',
                ...this.simpleInputVerbsAndLabel(),
              },
              streetAddress: {
                label: 'Street Address',
                ...this.simpleInputVerbsAndLabel(),
              },
              cityStateZipAddress: {
                label: 'City State Zip',
                ...this.simpleInputVerbsAndLabel(),
              },
            },
          }}
          totalizers={[
            {
              label: 'Sales',
              value: '420.763',
              icon: <IconShoppingCart size={14} />,
            },
            {
              label: 'Cash in',
              value: 'R$ 890.239,05',
              iconBackgroundColor: '#eafce3',
              icon: <IconArrowUp color="#79B03A" size={14} />,
            },

            {
              label: 'Cash out',
              value: '- R$ 13.485,26',
              icon: <IconArrowDown size={14} />,
            },
          ]}
          bulkActions={{
            texts: {
              secondaryActionsLabel: 'Actions',
              rowsSelected: (qty: any) => (
                <Fragment>Selected rows: {qty}</Fragment>
              ),
              selectAll: 'Select all',
              allRowsSelected: (qty: any) => (
                <Fragment>All rows selected: {qty}</Fragment>
              ),
            },
            totalItems: 100,
            main: {
              label: 'Send email',
              handleCallback: (_params: any) => alert('TODO: SHOW EMAIL FORM'),
            },
            others: [
              {
                label: 'Delete',
                handleCallback: (params: any) => console.warn(params),
              },
            ],
          }}
        />
      </div>
    )
  }
}

export default withRuntimeContext(UsersTable)

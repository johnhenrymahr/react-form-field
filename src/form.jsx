import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export class Form extends PureComponent {
  state = {
    isSubmitting: false
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      derivedProps,
      isDisabled,
      onSubmit,
      onValidationError,
      ...props
    } = this.props

    return (
      <form
        { ...props }
        { ...derivedProps(this.state) }
        onSubmit={ this.onSubmit }
      >
        {
          React.Children.map(this.props.children, child => {
            if (child) {
              if (typeof child.type === 'function' && child.type.name === 'Field') {
                return React.cloneElement(child, {
                  autoFill: this.autoFill,
                  isDisabled: this.props.isDisabled,
                  registerGetter: this.registerGetter,
                  registerUpdater: this.registerUpdater,
                  unregister: this.unregister,
                  ...this.state
                })
              } else {
                return child
              }
            }
          })
        }
      </form>
    )
  }

  _isMounted = false

  _getters = {}

  _updaters = {}

  autoFill = (id, value) => {
    if (typeof this._updaters[id] === 'function') {
      this._updaters[id](value)
    }
  }

  onSubmit = event => {
    event.preventDefault()
    if (this.props.isDisabled || this.state.isSubmitting) {
      return
    }
    const { onSubmit, onValidationError } = this.props
    this.setState({ isSubmitting: true }, async () => {
      const fieldData = {}
      const fields = this.getFields().map(field => {
        if (typeof this._updaters[field.name] === 'function') {
          field = { ...this._updaters[field.name](field.value) }
        }
        fieldData[field.name] = field.value
        return field
      })
      const invalidFields = this.getInvalidFields(fields)
      if (invalidFields.length === 0) {
        await onSubmit(fieldData, event)
      } else {
        if (typeof onValidationError === 'function') {
          await onValidationError(fieldData, invalidFields, event)
        }
      }
      if (this._isMounted) {
        this.setState({ isSubmitting: false })
      }
    })
  }

  getFields () {
    return Object.entries(this._getters)
      .map(([name, getter]) => ({
        name,
        ...getter()
      }))
  }

  getInvalidFields (fields = []) {
    return fields.filter(field => !field.isValid)
  }

  registerGetter = (name, func) => {
    this._getters[name] = func
  }

  registerUpdater = (name, func) => {
    this._updaters[name] = func
  }

  unregister = name => {
    if (name in this._getters) {
      delete this._getters[name]
    }
    if (name in this._updaters) {
      delete this._updaters[name]
    }
  }
}

Form.defaultProps = {
  derivedProps: () => {},
  isDisabled: false,
  onSubmit: () => {}
}

Form.propTypes = {
  derivedProps: PropTypes.func,
  isDisabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  onValidationError: PropTypes.func
}

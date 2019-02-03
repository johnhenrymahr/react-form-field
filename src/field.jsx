import { Component } from 'react'
import PropTypes from 'prop-types'

export class Field extends Component {
  state = {
    isValid: false,
    isValidated: false,
    value: '',
  }

  componentDidMount() {
    const {
      initialValue,
      name,
      registerGetter,
      registerUpdater,
      shouldRegister,
    } = this.props
    if (shouldRegister && typeof registerUpdater === 'function') {
      registerUpdater(name, this.updateField)
    }
    if (shouldRegister && typeof registerGetter === 'function') {
      registerGetter(name, this.getFieldData)
    }
    if (initialValue) {
      this.updateField(initialValue)
    }
  }

  componentWillUnmount() {
    const { name, shouldRegister, unregister } = this.props
    if (shouldRegister && typeof unregister === 'function') {
      unregister(name)
    }
  }

  render() {
    const { autoFill, children, isDisabled, isSubmitting, name } = this.props

    return children({
      autoFill,
      isDisabled,
      isSubmitting,
      name,
      setFieldValueHandler: this.setFieldValueHandler,
      updateField: this.updateField,
      validateFieldHandler: this.validateFieldHandler,
      ...this.state,
    })
  }

  getFieldData = () => {
    return this.state
  }

  updateField = (value = '', event = {}) => {
    const {
      autoFill,
      isDisabled,
      isSubmitting,
      name,
      onFieldUpdate,
      validate,
    } = this.props

    const isValid =
      typeof validate === 'function' ? validate(name, value) : true
    this.setState({ isValidated: true, isValid, value }, () => {
      onFieldUpdate(
        {
          autoFill,
          isDisabled,
          isSubmitting,
          name,
          updateField: this.updateField,
          ...this.state,
        },
        event
      )
    })
    return { name, isValid, value }
  }

  /**
    setFieldValueHandler
    @param event object ReactSyntheticEvent

    handler that sets the field value to the field state using
    value selector to get the current value from event object.
    It does NOT run validation and does NOT call onFieldUpdate handler.
    use it for controlled form components that need to store their
    value in state when validation is not appropriate, (doing onBlur validation)
    generally used as the onChange handler
   */
  setFieldValueHandler = event => {
    const { valueSelector } = this.props
    this.setState({ value: valueSelector(event) })
  }

  validateFieldHandler = event => {
    const { valueSelector } = this.props
    const value = valueSelector(event)
    this.updateField(value, event)
  }
}

Field.defaultProps = {
  isDisabled: false,
  isSubmitting: false,
  shouldRegister: true,
  onFieldUpdate: () => {},
  valueSelector: event => event.target.value,
}

Field.propTypes = {
  autoFill: PropTypes.func,
  children: PropTypes.func.isRequired,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isDisabled: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onFieldUpdate: PropTypes.func,
  registerGetter: PropTypes.func,
  registerUpdater: PropTypes.func,
  shouldRegister: PropTypes.bool,
  unregister: PropTypes.func,
  validate: PropTypes.func,
  valueSelector: PropTypes.func,
}

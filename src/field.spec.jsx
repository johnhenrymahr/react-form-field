import React from 'react'
import { shallow } from 'enzyme'
import { Field } from './field'

const mockContainer = { updaters: {}, getters: {} }
const autoFill = jest.fn()
const registerUpdater = jest.fn((name, updater) => {
  mockContainer.updaters[name] = updater
})
const registerGetter = jest.fn((name, getter) => {
  mockContainer.getters[name] = getter
})
const unregister = jest.fn()
const validate = jest.fn((i, v) => v === 'test1')

function setup(otherProps = {}) {
  const props = {
    autoFill,
    name: 'test',
    registerGetter,
    registerUpdater,
    unregister,
    validate,
    ...otherProps
  }
  return shallow(
    <Field {...props}>
      {({
        validateFieldHandler,
        isValid,
        isValidated,
        setFieldValueHandler,
        value
      }) => (
        <input
          onChange={setFieldValueHandler}
          onBlur={validateFieldHandler}
          value={value}
          aria-invalid={isValidated && !isValid}
        />
      )}
    </Field>
  )
}

beforeEach(() => {
  autoFill.mockClear()
  mockContainer.updaters = {}
  mockContainer.getters = {}
  registerGetter.mockClear()
  registerUpdater.mockClear()
  validate.mockClear()
  unregister.mockClear()
})

describe('Field Component spec', () => {
  it('renders ', () => {
    const wrapper = setup()
    expect(wrapper).toMatchSnapshot()
  })
  it('registers and unregisters ', () => {
    const wrapper = setup()
    expect(registerUpdater.mock.calls.length).toEqual(1)
    expect(registerUpdater.mock.calls[0][0]).toEqual('test')
    expect(registerGetter.mock.calls.length).toEqual(1)
    expect(registerGetter.mock.calls[0][0]).toEqual('test')
    wrapper.unmount()
    expect(unregister.mock.calls.length).toEqual(1)
  })
  it('does not register and unregister if shouldRegister is false', () => {
    const wrapper = setup({ shouldRegister: false })
    expect(registerUpdater.mock.calls.length).toEqual(0)
    expect(registerGetter.mock.calls.length).toEqual(0)
    wrapper.unmount()
    expect(unregister.mock.calls.length).toEqual(0)
  })
  it('sets state correctly for a valid input', async () => {
    const wrapper = setup()
    expect(wrapper.find('input').length).toEqual(1)
    await wrapper.find('input').simulate('blur', { target: { value: 'test1' } })
    expect(wrapper.state()).toEqual({
      isValid: true,
      isValidated: true,
      value: 'test1',
      validationMessage: ''
    })
    expect(wrapper.find('input').prop('aria-invalid')).toEqual(false)
  })
  it('calls onFieldUpdate with correct props after validation', async () => {
    const onFieldUpdate = jest.fn()
    const event = { target: { value: 'test1' } }
    const wrapper = setup({ onFieldUpdate })
    expect(wrapper.find('input').length).toEqual(1)
    await wrapper.find('input').simulate('blur', event)
    wrapper.update()
    expect(onFieldUpdate.mock.calls.length).toEqual(1)
    expect(onFieldUpdate.mock.calls[0][0].isValid).toEqual(true)
    expect(onFieldUpdate.mock.calls[0][0].isValidated).toEqual(true)
    expect(onFieldUpdate.mock.calls[0][0].value).toEqual('test1')
    expect(onFieldUpdate.mock.calls[0][1]).toEqual(event)
  })
  it('sets state correctly for a invalid input', async () => {
    const wrapper = setup()
    expect(wrapper.find('input').length).toEqual(1)
    await wrapper.find('input').simulate('blur', { target: { value: 'test2' } })
    expect(wrapper.state()).toEqual({
      isValid: false,
      isValidated: true,
      value: 'test2',
      validationMessage: ''
    })
    expect(wrapper.find('input').prop('aria-invalid')).toEqual(true)
  })
  it('sets state correctly for a invalid input with validation message', async () => {
    const wrapper = setup({
      validate: (name, value) => (value === 'test' ? '' : 'Value must be test.')
    })
    expect(wrapper.find('input').length).toEqual(1)
    await wrapper.find('input').simulate('blur', { target: { value: 'test2' } })
    expect(wrapper.state()).toEqual({
      isValid: false,
      isValidated: true,
      value: 'test2',
      validationMessage: 'Value must be test.'
    })
    expect(wrapper.find('input').prop('aria-invalid')).toEqual(true)
  })

  it('returns props when calling updater directly ', () => {
    setup()
    expect(mockContainer.updaters.test('test1')).toEqual({
      isValid: true,
      name: 'test',
      value: 'test1',
      validationMessage: ''
    })
  })
  it('returns state when getter is called', async () => {
    const wrapper = setup()
    await wrapper.find('input').simulate('blur', { target: { value: 'test2' } })
    expect(mockContainer.getters.test()).toEqual({
      isValid: false,
      isValidated: true,
      value: 'test2',
      validationMessage: ''
    })
  })
  it('calls update field if an initial value is supplied', () => {
    setup({ initialValue: 'test2' })
    expect(mockContainer.getters.test()).toEqual({
      isValid: false,
      isValidated: true,
      value: 'test2',
      validationMessage: ''
    })
  })
  it('passes value through normalizer before setting to state', () => {
    const wrapper = setup({ normalizer: value => value.toUpperCase() })
    wrapper.instance().validateFieldHandler({ target: { value: 'test1' } })
    expect(wrapper.state('value')).toEqual('TEST1')
  })
  it('can set value to state without validation for onChange handlers', async () => {
    const wrapper = setup()
    await wrapper
      .find('input')
      .simulate('change', { target: { value: 'test2' } })
    expect(wrapper.state()).toEqual({
      isValid: false,
      isValidated: false,
      value: 'test2',
      validationMessage: ''
    })
  })
  it('passes all the correct props to the child', () => {
    const children = jest.fn()
    const props = {
      children,
      name: 'otherTest'
    }
    shallow(<Field {...props} />)
    expect(children.mock.calls.length).toEqual(1)
    expect(Object.keys(children.mock.calls[0][0])).toEqual([
      'autoFill',
      'isDisabled',
      'isSubmitting',
      'name',
      'setFieldValueHandler',
      'updateField',
      'validateFieldHandler',
      'isValid',
      'isValidated',
      'value',
      'validationMessage'
    ])
  })
})

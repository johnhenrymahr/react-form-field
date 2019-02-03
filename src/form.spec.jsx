import React from 'react'
import { shallow, mount } from 'enzyme'
import { Form, Field } from '.'
const onSubmit = jest.fn()
const onValidationError = jest.fn()

beforeEach(() => {
  onSubmit.mockClear()
  onValidationError.mockClear()
})

function setup(otherProps = {}, renderer = shallow) {
  const props = {
    onSubmit,
    onValidationError,
    ...otherProps,
  }
  return renderer(
    <Form {...props}>
      <p>This is a some copy</p>
      <Field name="test1" validate={(name, value) => value === 'foobar'}>
        {({ validateFieldHandler }) => (
          <input className="test1" onChange={validateFieldHandler} />
        )}
      </Field>
      <Field name="test2" initialValue="fred">
        {({ validateFieldHandler, value }) => (
          <input
            className="test2"
            onChange={validateFieldHandler}
            value={value}
          />
        )}
      </Field>
      <Field name="testfill" shouldRegister={false}>
        {({ autoFill }) => (
          <a
            href="javascript:void(0)"
            onClick={() => {
              autoFill('test2', 'filled-value')
            }}
          >
            click me
          </a>
        )}
      </Field>
      <input className="submit-field" type="submit" value="Submit the form" />
    </Form>
  )
}

describe('Form spec', () => {
  it('renders and sets _isMounted ', () => {
    const wrapper = setup()
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.instance()._isMounted).toEqual(true)
  })
  it('clones extra props to child Field components', () => {
    const wrapper = setup()
    expect(
      typeof wrapper
        .find(Field)
        .first()
        .prop('autoFill')
    ).toEqual('function')
  })
  it('does not clone elements to non Field components', () => {
    const wrapper = setup()
    expect(typeof wrapper.find('.submit-field').prop('autoFill')).toEqual(
      'undefined'
    )
  })
  it('checks for validity', () => {
    const wrapper = setup()
    expect(
      wrapper
        .instance()
        .getInvalidFields([{ isValid: true }, { isValid: true }]).length
    ).toEqual(0)
    expect(
      wrapper
        .instance()
        .getInvalidFields([
          { isValid: true },
          { isValid: false },
          { isValid: true },
        ]).length
    ).toEqual(1)
  })
  it('can auto fill another field', () => {
    const wrapper = setup({}, mount)
    expect(wrapper.find('.test2').prop('value')).toEqual('fred')
    wrapper.find('a').simulate('click')
    expect(wrapper.find('.test2').prop('value')).toEqual('filled-value')
  })
  it('calls correct handlers based on form validation', async () => {
    const wrapper = setup({}, mount)
    await wrapper.find('form').simulate('submit')
    expect(onSubmit.mock.calls.length).toEqual(0)
    expect(onValidationError.mock.calls.length).toEqual(1)
    expect(onValidationError.mock.calls[0][0]).toEqual({
      test1: '',
      test2: 'fred',
    })
    wrapper.update()
    wrapper.find({ name: 'test1' }).setState({ value: 'foobar' })
    wrapper.update()
    await wrapper.find('form').simulate('submit')
    expect(onSubmit.mock.calls.length).toEqual(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({
      test1: 'foobar',
      test2: 'fred',
    })
  })
})

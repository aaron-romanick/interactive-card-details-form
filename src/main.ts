import './style.scss'
import type { ICardElement, IContainer } from './scripts/types'

const IS_ANDROID = navigator.userAgent.indexOf('ndroid') > -1
const CONTAINERS = [
  {
    element: document.querySelector('.form-container') as HTMLElement,
    buttonText: 'Confirm',
  },
  {
    element: document.querySelector('.acknowledgement-container') as HTMLElement,
    buttonText: 'Continue',
  },
] as const

const ANIMATIONS = {
  FADE_IN_DOWN: 'fade-in-down',
  FADE_OUT_UP: 'fade-out-up',
} as const

const ERROR_MESSAGES = {
  REQUIRED: `Can't be blank`,
  NUMBER: 'Wrong format, numbers only',
  CARD: 'Wrong format, must be valid credit card number',
  DATE: 'Wrong format, valid date only',
  CVC: 'Wrong format, must be valid CVC',
} as const

const TOUCHED = 'touched'

const viewNumber = document.querySelector('.view-number') as HTMLElement
const viewName = document.querySelector('.view-name') as HTMLElement
const viewExpMonth = document.querySelector('.view-exp-month') as HTMLElement
const viewExpYear = document.querySelector('.view-exp-year') as HTMLElement
const viewCVC = document.querySelector('.view-cvc') as HTMLElement

const inputName = document.getElementById('input-name') as HTMLInputElement
const inputNumber = document.getElementById('input-number') as HTMLInputElement
const inputExpMonth = document.getElementById('input-exp-month') as HTMLInputElement
const inputExpYear = document.getElementById('input-exp-year') as HTMLInputElement
const inputCVC = document.getElementById('input-cvc') as HTMLInputElement
const buttonAction = document.querySelector('.button-action') as HTMLButtonElement

const allInputs = Array.from([
  inputNumber,
  inputName,
  inputExpMonth,
  inputExpYear,
  inputCVC,
])
const allCardElements: ICardElement[] = Array.from([
  { view: viewNumber, input: inputNumber },
  { view: viewName, input: inputName },
  { view: viewExpMonth, input: inputExpMonth },
  { view: viewExpYear, input: inputExpYear },
  { view: viewCVC, input: inputCVC },
])
const allFocusables: NodeListOf<HTMLInputElement | HTMLButtonElement> = document.querySelectorAll(
  '.form-container input:not([disabled]):not([type="hidden"])'
)

const resetInput = (input: HTMLInputElement, view?: HTMLElement) => {
  input.value = ''
  delete input.dataset.touched
  clearErrors(input)
  if(view) {
    input.id === 'input-number'
      ? updateView(view, input.value, formatCreditCardNumber)
      : updateView(view, input.value)
  }
}

const updateView = (view: HTMLElement, val: string, formatCallback?: (val: string) => string) => {
  let text = formatCallback ? formatCallback('') : ''
  if(val === '' && view.dataset.placeholder) {
    text = formatCallback
      ? formatCallback(view.dataset.placeholder)
      : view.dataset.placeholder
  } else if(view.dataset.padLength) {
    const isUsePadEnd = view.dataset.padDirection && view.dataset.padDirection === 'right'
    if(formatCallback) {
      text = isUsePadEnd
        ? formatCallback(val.padEnd(+view.dataset.padLength, '0'))
        : formatCallback(val.padStart(+view.dataset.padLength, '0'))
    } else {
      text = isUsePadEnd
        ? val.padEnd(+view.dataset.padLength, '0')
        : val.padStart(+view.dataset.padLength, '0')
    }
  } else {
    text = val
  }
  view.innerText = text
}

const clearErrors = (input: HTMLInputElement) => {
  delete input.dataset.state
  const siblingInputs = (input.parentElement as HTMLElement).querySelectorAll('[data-state="has-error"]') as NodeListOf<HTMLInputElement>
  if(siblingInputs.length === 0) {
    setErrorMessage(input, '')
  }
}

const setErrorMessage = (input: HTMLInputElement, message: string) => {
  ((input.parentElement as HTMLElement).querySelector('.error-message') as HTMLElement).innerText = message
}

const resetAllInputs = () => {
  allCardElements.forEach((cardElement: ICardElement) => {
    const view = cardElement.view ?? undefined
    resetInput(cardElement.input, view)
  })
}

const validateAllInputs = () => {
  let isAllValid = true
  allInputs.some((input: HTMLInputElement) => {
    if(!validateInput(input)) {
      isAllValid = false
    }
  })
  return isAllValid
}

const validateInput = (input: HTMLInputElement) => {
  let hasError = true
  let errorMessage = ''
  const value = input.value
  const validationSchema: string[] = input.dataset.validationSchema
    ? JSON.parse(input.dataset.validationSchema)
    : []
  if(!input.dataset.touched) {
    input.dataset.touched = TOUCHED
  }
  switch(true) {
    case(input.required && value === ''):
      errorMessage = ERROR_MESSAGES.REQUIRED
      break
    case(validationSchema.includes('number') && !value.match(/^[0-9]+$/)):
      errorMessage = ERROR_MESSAGES.NUMBER
      break
    case(validationSchema.includes('card') && !value.match(/^[0-9]{4}(?: [0-9]{4}){3}$/)):
      errorMessage = ERROR_MESSAGES.CARD
      break
    case(validationSchema.includes('month') && !value.match(/^(?:1[0-2]|0[1-9])$/)):
    case(validationSchema.includes('year') && !value.match(/^[0-9]{2}$/)):
      errorMessage = ERROR_MESSAGES.DATE
      break
    case(validationSchema.includes('cvc') && !value.match(/^[0-9]{3}$/)):
      errorMessage = ERROR_MESSAGES.CVC
      break
    default:
      hasError = false
      break
  }

  if(hasError) {
    input.dataset.state = 'has-error'
    ;setErrorMessage(input, errorMessage)
  }
  return !hasError
}

const handleBlur = (input: HTMLInputElement) => {
  if(!input.dataset.touched) {
    input.dataset.touched = TOUCHED
  }
  const isValid = validateInput(input)
  if(isValid) {
    clearErrors(input)
  }
}

const handleInput = (data: string, input: HTMLInputElement, view: HTMLElement) => {
  const cursorPos = input.selectionEnd as number
  const prevVal = input.value
  input.value = valFormat(input)
  if(input.dataset.touched) {
    const isValid = validateInput(input)
    if(isValid) {
      clearErrors(input)
    }
  }
  if(input.id === 'input-number') {
    setCursorPosition(input, data, cursorPos, prevVal)
    updateView(view, input.value, formatCreditCardNumber)
  } else {
    updateView(view, input.value)
  }
  focusNextOnEnd(input.selectionEnd as number, +(view.dataset.padLength as string))
}

const addEventListeners = () => {
  const allVisibleCardElements = allCardElements.filter((cardElement: ICardElement) => cardElement.input.type !== 'hidden')
  allVisibleCardElements.forEach((cardElement: ICardElement) => {
    cardElement.input.addEventListener('blur', (evt: Event) => {
      const blurredInput = evt.target as HTMLInputElement
      handleBlur(blurredInput)
    })
    cardElement.input.addEventListener('input', (evt: Event) => {
      const inputtedInput = evt.target as HTMLInputElement
      const view = cardElement.view ?? undefined
      handleInput((evt as InputEvent).data ?? '', inputtedInput, view as HTMLElement)
    })
  })
  buttonAction.addEventListener('click', (evt: Event) => {
    const container = CONTAINERS.find(container => !container.element.dataset.state || container.element.dataset.state !== 'is-hidden') as IContainer
    const button = evt.target as HTMLButtonElement
    if(container.element.classList.contains('form-container')) {
      const isAllValid = validateAllInputs()
      if(isAllValid) {
        switchInteractionContainer(container.element, button)
      }
    } else {
      resetAllInputs()
      switchInteractionContainer(container.element, button)
    }
  })
  CONTAINERS.forEach(container => {
    container.element.addEventListener('animationend', async (evt: AnimationEvent) => {
      if(evt.animationName === ANIMATIONS.FADE_OUT_UP) {
        const current = evt.target as HTMLElement
        const nextContainer = CONTAINERS.find(container => {
          return container.element !== current
        }) as IContainer
        const [next, nextButtonText] = [nextContainer.element, nextContainer.buttonText]
        current.dataset.state = 'is-hidden'
        buttonAction.dataset.state = 'is-hidden'
        await delay(500)
        console.log(evt)
        delete current.dataset.animated
        buttonAction.textContent = nextButtonText
        delete next.dataset.state
        delete buttonAction.dataset.state
        next.dataset.animated = ANIMATIONS.FADE_IN_DOWN
        buttonAction.dataset.animated = ANIMATIONS.FADE_IN_DOWN
      }
    })
  })
}

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const switchInteractionContainer = (containerElement: HTMLElement, button: HTMLButtonElement) => {
  containerElement.dataset.animated = ANIMATIONS.FADE_OUT_UP
  button.dataset.animated = ANIMATIONS.FADE_OUT_UP
}

const valFormat = (input: HTMLInputElement) => {
  let formattedVal = input.value
  switch(true) {
    case input.id === 'input-number':
      if(IS_ANDROID) {
        setTimeout(() => {
          formattedVal = formatCreditCardNumber(input.value)
          inputNumber.value = formatNumber(input.value)
        })
      } else {
        formattedVal = formatCreditCardNumber(input.value)
        inputNumber.value = formatNumber(input.value)
      }
      break
    case input.id === 'input-exp-month':
      formattedVal = formatExpMonth(input.value)
      break
    case input.id === 'input-exp-year':
      formattedVal = formatNumber(input.value)
      break
    case input.id === 'input-cvc':
      formattedVal = formatNumber(input.value)
      break
  }
  return formattedVal
}

/**
 * https://stackoverflow.com/questions/17260238/how-to-insert-space-every-4-characters-for-iban-registering
 * @rob-juurlink
 */
const formatCreditCardNumber = (val: string) => {
  return formatNumber(val) // replace non-numbers
    .replace(/^(.{16}).*$/, '$1') // replace anything over 16 characters
    .replace(/(.{4})/g, '$1 ') // add spaces in every 4 characters
    .trim() // remove any final spaces
}

const formatExpMonth = (val: string) => {
  return formatNumber(val)
    .replace(/^([2-9])$/, '0$1')
}

const formatNumber = (val: string) => {
  return val.replace(/[^0-9]/g, '')
}

/**
 * https://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index
 * @Mx.
 * @mesqueeb
 */
const focusNextOnEnd = (currentPos: number, maxPos: number) => {
  if(document.activeElement && currentPos >= maxPos) {
    const i = Array.from(allFocusables).indexOf(document.activeElement as HTMLInputElement)
    const nextInput = allFocusables[i + 1]
    if(i > -1 && nextInput) {
      nextInput.focus()
    }                    
  }
}

/**
 * https://stackoverflow.com/questions/17260238/how-to-insert-space-every-4-characters-for-iban-registering
 * @rob-juurlink
 */
const countSpaces = (str: string) => {
    var spaces = str.match(/(\s+)/g)
    return spaces ? spaces.length : 0
}

const setCursorPosition = (input: HTMLInputElement, data: string, cursorPosition: number, previousVal: string) => {
  if (cursorPosition !== input.value.length) {
    const dataWithNoNumbersOrSpaces = data.replace(/[0-9 ]/g, '')
    const beforeCursor = previousVal.substring(0, cursorPosition)
    const countPrev = countSpaces(beforeCursor)
    const countCurrent = countSpaces(formatCreditCardNumber(beforeCursor))
    input.selectionEnd = cursorPosition - dataWithNoNumbersOrSpaces.length + (countCurrent - countPrev)
  }
}
/**
 * Page run
 */
(() => {
  resetAllInputs()
  addEventListeners()
})()
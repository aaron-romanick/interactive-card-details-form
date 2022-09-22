/**
 * ------------- IMPORTS -------------
 */
import './style.scss'
import type { ICardElement, IContainer } from './scripts/types'

/**
 * ------------- CONSTANTS  -------------
 */
// Checks if device is an Android
const IS_ANDROID = navigator.userAgent.indexOf('ndroid') > -1
// Interaction container information
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
// Fade animations
const ANIMATIONS = {
  FADE_IN_DOWN: 'fade-in-down',
  FADE_OUT_UP: 'fade-out-up',
} as const
// Error messages
const ERROR_MESSAGES = {
  REQUIRED: `Can't be blank`,
  NUMBER: 'Wrong format, numbers only',
  CARD: 'Wrong format, must be valid credit card number',
  DATE: 'Wrong format, valid future date only',
  CVC: 'Wrong format, must be valid CVC',
} as const
// Form 'touched' state
const TOUCHED = 'touched'

/**
 * ------------- DOM ELEMENTS  -------------
 */
// Credit Card View Details
const viewNumber = document.querySelector('.view-number') as HTMLElement
const viewName = document.querySelector('.view-name') as HTMLElement
const viewExpMonth = document.querySelector('.view-exp-month') as HTMLElement
const viewExpYear = document.querySelector('.view-exp-year') as HTMLElement
const viewCVC = document.querySelector('.view-cvc') as HTMLElement
// Credit Card Form Inputs
const inputName = document.getElementById('input-name') as HTMLInputElement
const inputNumber = document.getElementById('input-number') as HTMLInputElement
const inputExpMonth = document.getElementById('input-exp-month') as HTMLInputElement
const inputExpYear = document.getElementById('input-exp-year') as HTMLInputElement
const inputCVC = document.getElementById('input-cvc') as HTMLInputElement
const buttonAction = document.querySelector('.button-action') as HTMLButtonElement
// All Form Inputs
const allInputs = Array.from([
  inputNumber,
  inputName,
  inputExpMonth,
  inputExpYear,
  inputCVC,
])
// All Form and View Elements Tied Together
const allCardElements: ICardElement[] = Array.from([
  { view: viewNumber, input: inputNumber },
  { view: viewName, input: inputName },
  { view: viewExpMonth, input: inputExpMonth },
  { view: viewExpYear, input: inputExpYear },
  { view: viewCVC, input: inputCVC },
])
// All Focusable Elements to Programmatically Tab To
const allFocusables: NodeListOf<HTMLInputElement | HTMLButtonElement> = document.querySelectorAll(
  '.form-container input:not([disabled]):not([type="hidden"])'
)

/**
 * Reset an input element and it's associated view
 * 
 * @param {ICardElement} cardElement - Card element to reset
 */
const resetInput = (cardElement: ICardElement) => {
  cardElement.input.value = ''
  // Delete `touched` data
  delete cardElement.input.dataset.touched
  // Clear errors
  clearErrors(cardElement.input)
  // Update view element; if its the credit card number field,
  // format it special
  cardElement.input.id === 'input-number'
    ? updateView(cardElement.view, cardElement.input.value, formatCreditCardNumber)
    : updateView(cardElement.view, cardElement.input.value)
}

/**
 * Reset all input elements and associated views
 */
const resetAllInputs = () => {
  allCardElements.forEach((cardElement: ICardElement) => {
    resetInput(cardElement)
  })
}

/**
 * Clear errors from an input
 * 
 * @param {HTMLInputElement} input - Input element
 */
const clearErrors = (input: HTMLInputElement) => {
  // delete `state` data attribute
  delete input.dataset.state
  // Get sibling inputs that have errors
  const siblingInputs = (input.parentElement as HTMLElement).querySelectorAll('[data-state="has-error"]') as NodeListOf<HTMLInputElement>
  // Reset error if no sibling inputs
  if(siblingInputs.length === 0) {
    setErrorMessage(input, '')
  }
}
/**
 * Set error message
 * 
 * @param {HTMLInputElement} input - Input element that has error
 * @param {string} message - Error message 
 */
const setErrorMessage = (input: HTMLInputElement, message: string) => {
  ((input.parentElement as HTMLElement).querySelector('.error-message') as HTMLElement).innerText = message
}

/**
 * Update the view element with the appropriate value from the form
 * 
 * @param {HTMLElement} view - the DOM element to be insterted into
 * @param {string} val - the value to insert into the view
 * @param {string} formatCallback - a call back to specially format the view
 */
const updateView = (view: HTMLElement, val: string, formatCallback?: (val: string) => string) => {
  // initialize `text` variable
  let text = formatCallback ? formatCallback('') : ''
  // Use placeholder if available and input is empty
  if(val === '' && view.dataset.placeholder) {
    text = formatCallback
      ? formatCallback(view.dataset.placeholder)
      : view.dataset.placeholder
  // Pad value if padding data attributes set
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

/**
 * Validate all inputs
 * @returns {boolean}
 */
const validateAllInputs = () => {
  let isAllValid = true
  allInputs.some((input: HTMLInputElement) => {
    if(!validateInput(input)) {
      isAllValid = false
      return true
    }
    return false
  })
  return isAllValid
}
/**
 * Validate an input
 * 
 * @param {HTMLInputElement} input - The input to validate
 * @returns {boolean}
 */
const validateInput = (input: HTMLInputElement) => {
  let hasError = true
  let errorMessage = ''
  const value = input.value
  // Take validation schema from element data attribute and transform it
  // into an array
  const validationSchema: string[] = input.dataset.validationSchema
    ? JSON.parse(input.dataset.validationSchema)
    : []
  // Set `touched` data attribute if not set
  if(!input.dataset.touched) {
    input.dataset.touched = TOUCHED
  }
  // Set appropriate error message if input value doesn't match
  // appropriate format
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
    case(
      validationSchema.some(item => ['month', 'year'].includes(item)) &&
      inputExpMonth.dataset.touched && inputExpYear.dataset.touched &&
      !isValidFutureDate(+inputExpMonth.value, +inputExpYear.value)
    ):
      errorMessage = ERROR_MESSAGES.DATE
      break
    case(validationSchema.includes('cvc') && !value.match(/^[0-9]{3}$/)):
      errorMessage = ERROR_MESSAGES.CVC
      break
    default:
      hasError = false
      break
  }

  // If `hasError` set, display error on input
  if(hasError) {
    input.dataset.state = 'has-error'
    ;setErrorMessage(input, errorMessage)
  }
  // Return `true` if no errors; `false` if any errors
  return !hasError
}

/**
 * Blur event handler on inputs
 * 
 * @param {HTMLInputElement} input - Input element
 */
const handleBlur = (input: HTMLInputElement) => {
  // Set `touched` on input if not already set
  if(!input.dataset.touched) {
    input.dataset.touched = TOUCHED
  }
  // Check if input valid
  const isValid = validateInput(input)
  if(isValid) {
    clearErrors(input)
  }
}

/**
 * Input event handler on inputs
 * 
 * @param {string} data - The input data
 * @param {HTMLInputElement} input - Input element
 * @param {HTMLElement} view - View element
 */
const handleInput = (data: string, input: HTMLInputElement, view: HTMLElement) => {
  // Cursor position within input
  const cursorPos = input.selectionEnd as number
  // Input value
  const prevVal = input.value
  // Change input value to formatted value
  input.value = valFormat(input)
  // Run validation if `touched` set on input
  if(input.dataset.touched) {
    const isValid = validateInput(input)
    // Clear away errors if input is valid
    if(isValid) {
      clearErrors(input)
    }
  }
  // On credit card number, format view element to credit card number and
  // adjust input cursor position to compensate for formatting
  if(input.id === 'input-number') {
    setCursorPosition(input, data, cursorPos, prevVal)
    updateView(view, input.value, formatCreditCardNumber)
  // Update view element with input value
  } else {
    updateView(view, input.value)
  }
  // Move focus to next form input if cursor at the end of input
  focusNextOnEnd(input.selectionEnd as number, +(view.dataset.padLength as string))
}/**
 * When container element fade out animation ends,
 * swap and show sibling container elemnt in it's place
 * 
 * @param {AnimationEvent} evt - The animation end event
 */
const handleAnimationEnd = async (evt: AnimationEvent) => {
  // Set delay between fade in and fade out events
  const delayTime = 500
  // Only do following if animation name is `fade-out-up`
  if(evt.animationName === ANIMATIONS.FADE_OUT_UP) {
    const current = evt.target as HTMLElement
    // Get sibling container
    const nextContainer = CONTAINERS.find(container => {
      return container.element !== current
    }) as IContainer
    const [next, nextButtonText] = [nextContainer.element, nextContainer.buttonText]
    // Set current container and button to hidden
    current.dataset.state = 'is-hidden'
    buttonAction.dataset.state = 'is-hidden'
    // Wait
    await delay(delayTime)
    // Remove `animated` data attribute
    delete current.dataset.animated
    // Change button text
    buttonAction.textContent = nextButtonText
    // Remove hidden button from next container and button
    delete next.dataset.state
    delete buttonAction.dataset.state
    // Setup fade in animation data attributes
    next.dataset.animated = ANIMATIONS.FADE_IN_DOWN
    buttonAction.dataset.animated = ANIMATIONS.FADE_IN_DOWN
  }
}

/**
 * Add event listeners to page elements
 */
const addEventListeners = () => {
  // Get all card elements that are visible and loop through them
  const allVisibleCardElements = allCardElements.filter((cardElement: ICardElement) => cardElement.input.type !== 'hidden')
  allVisibleCardElements.forEach((cardElement: ICardElement) => {
    // Handle blue
    cardElement.input.addEventListener('blur', (evt: Event) => {
      const blurredInput = evt.target as HTMLInputElement
      handleBlur(blurredInput)
    })
    // Handle input
    cardElement.input.addEventListener('input', (evt: Event) => {
      const inputtedInput = evt.target as HTMLInputElement
      const view = cardElement.view ?? undefined
      handleInput((evt as InputEvent).data ?? '', inputtedInput, view as HTMLElement)
    })
  })
  // Handle button clicks
  buttonAction.addEventListener('click', (evt: Event) => {
    // Get container elements and button element
    const container = CONTAINERS.find(container => !container.element.dataset.state || container.element.dataset.state !== 'is-hidden') as IContainer
    const button = evt.target as HTMLButtonElement
    // If the form is currently active, validate
    if(container.element.classList.contains('form-container')) {
      const isAllValid = validateAllInputs()
      // Switch visible containers only if form is valid
      if(isAllValid) {
        switchInteractionContainer(container.element, button)
      }
    // If acknowledgement container is active, reset form before displaying
    } else {
      resetAllInputs()
      switchInteractionContainer(container.element, button)
    }
  })
  // Handle fade out animation ending
  CONTAINERS.forEach(container => {
    container.element.addEventListener('animationend', async (evt: AnimationEvent) => {
      handleAnimationEnd(evt)
    })
  })
}

/**
 * Set animation state on containers and button
 * 
 * @param {HTMLElement} containerElement - Container element 
 * @param {HTMLButtonElement} button - Button element
 */
const switchInteractionContainer = (containerElement: HTMLElement, button: HTMLButtonElement) => {
  containerElement.dataset.animated = ANIMATIONS.FADE_OUT_UP
  button.dataset.animated = ANIMATIONS.FADE_OUT_UP
}

/**
 * Delay before next script action
 * 
 * @param {number} ms - Time in milliseconds 
 * @returns {Promise}
 */
const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Format the input value based on what type of number
 * it represents
 * 
 * @param {HTMLInputElement} input - Input element 
 * @returns {string}
 */
const valFormat = (input: HTMLInputElement) => {
  let formattedVal = input.value
  switch(true) {
    // Format credit card number
    case input.id === 'input-number':
      // Check if device is an Android
      if(IS_ANDROID) {
        // Wait a marginal amount of time before performing the format
        // to a credit card number
        setTimeout(() => {
          formattedVal = formatCreditCardNumber(input.value)
          inputNumber.value = formatNumber(input.value)
        })
      // Format as a credit card number and change input to that value
      } else {
        formattedVal = formatCreditCardNumber(input.value)
        inputNumber.value = formatNumber(input.value)
      }
      break
    // Format as an expiration date month value
    case input.id === 'input-exp-month':
      formattedVal = formatExpMonth(input.value)
      break
    // Format as an expiration date year value
    case input.id === 'input-exp-year':
      formattedVal = formatNumber(input.value)
      break
    // Format as a CVC
    case input.id === 'input-cvc':
      formattedVal = formatNumber(input.value)
      break
  }
  return formattedVal
}

/**
 * Check if input date (both month and year) is a valid
 * future date
 * 
 * @param {number} digits - Number of digits of the year (Between 1 ~ 4)
 * @returns {number}
 */
const isValidFutureDate = (month: number, year: number) => {
  // Make sure input is a number
  if(isNaN(month) || isNaN(year)) {
    return false
  }
  // Force year to be after 2000
  const fullYear = year + 2000
  // Get date, making sure that it corresponds to the last day of the month
  const formDateTime = new Date(fullYear, month, 0).getTime()
  // Compare today's date to input date
  const nowTime = new Date().getTime()
  return formDateTime >= nowTime
}

/**
 * Format as a credit card value
 * 
 * https://stackoverflow.com/questions/17260238/how-to-insert-space-every-4-characters-for-iban-registering
 * @rob-juurlink
 * @param {string} val - Input value
 * @returns {string} - String in credit card number format
 */
const formatCreditCardNumber = (val: string) => {
   // replace non-numbers
  return formatNumber(val)
    // replace anything over 16 characters
    .replace(/^(.{16}).*$/, '$1')
    // add spaces in every 4 characters
    .replace(/(.{4})/g, '$1 ')
    // remove any final spaces
    .trim()
}

/**
 * Format as monthly expiration date month
 * 
 * @param {string} val - Input value
 * @returns {string} - String in month format
 */
const formatExpMonth = (val: string) => {
  return formatNumber(val)
    .replace(/^([2-9])$/, '0$1')
}

/**
 * Format as a numeric string
 * 
 * @param {string} val - Input value
 * @returns {string} - String in number format
 */
const formatNumber = (val: string) => {
  return val.replace(/[^0-9]/g, '')
}

/**
 * Move the focus from one input field to the next if
 * the cursor is at the maximum possible position in the
 * current input field
 * 
 * https://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index
 * @Mx.
 * @mesqueeb
 * 
 * @param {number} currentPos - Current cursor position
 * @param {number} maxPos - Max position that the cursor can be in the input field
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
 * Count number of spaces in input value
 * 
 * https://stackoverflow.com/questions/17260238/how-to-insert-space-every-4-characters-for-iban-registering
 * @rob-juurlink
 * 
 * @param {string} val - Input value
 * @returns {number} - Number of spaces
 */
const countSpaces = (val: string) => {
    var spaces = val.match(/(\s+)/g)
    return spaces ? spaces.length : 0
}

/**
 * 
 * @param {HTMLInputElement} input - Input element
 * @param {data} data - Data of input characters
 * @param {cursorPosition} cursorPosition - Position of the cursor in input field
 * @param {previousVal} previousVal - Previous input value before formatting
 */
const setCursorPosition = (input: HTMLInputElement, data: string, cursorPosition: number, previousVal: string) => {
  if (cursorPosition !== input.value.length) {
    // Input data with numbers and spaces removed
    const dataWithNoNumbersOrSpaces = data.replace(/[0-9 ]/g, '')
    // Input value before cursor
    const beforeCursor = previousVal.substring(0, cursorPosition)
    // Count spaces before the cursor in previous value
    const countPrev = countSpaces(beforeCursor)
    // Count spaces before the cursor in formatted value
    const countCurrent = countSpaces(formatCreditCardNumber(beforeCursor))
    // Set cursor position
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
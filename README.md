# Frontend Mentor - Interactive Card details Form Solution

This is a solution to the [Interactive card details form challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/interactive-card-details-form-XpS8cKZDWw). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The Challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My Process](#my-process)
  - [Built With](#built-with)
  - [What I Learned](#what-i-learned)
  - [Continued Development](#continued-development)
  - [Useful Resources](#useful-resources)
- [Author](#author)

## <a name="overview"></a>Overview

### <a name="the-challenge"></a>The Challenge

Users should be able to:

- Fill in the form and see the card details update in real-time
- Receive error messages when the form is submitted if:
  - Any input field is empty
  - The card number, expiry date, or CVC fields are in the wrong format
- View the optimal layout depending on their device's screen size
- See hover, active, and focus states for interactive elements on the page

### <a name="screenshot"></a>Screenshot

![Interactive Card details Form Solution](./screenshot.png)

### <a name="links"></a>Links

- Solution URL: [https://www.frontendmentor.io/solutions/interactive-card-details-form-csstypescript-w-full-form-validation-eCxmYnMMj_](https://www.frontendmentor.io/solutions/interactive-card-details-form-csstypescript-w-full-form-validation-eCxmYnMMj_)
- Live Site URL: [https://aaron-romanick.github.io/interactive-card-details-form/](https://aaron-romanick.github.io/interactive-card-details-form/)

## <a name="my-process"></a>My Process

### <a name="built-with"></a>Built With

- Semantic HTML5 markup
- CSS custom properties
- CSS Grid
- Mobile-first workflow
- [SASS](https://sass-lang.com/) - CSS with superpowers
- [TypeScript](https://www.typescriptlang.org/) - Javascript with syntax for types
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling

### <a name="what-i-learned"></a>What I Learned

I feel like this challenge I really pushed myself hard. I would say over 80% of my time spent on this project was getting the form validation and correct formatting on the credit card number on input. I modelled my credit card input style on Stripe's, trying to get it only to allow numbers from the user's input, but automatically including the spaces between each four numbers. If you find any possible ways to circumvent the input, please let me know! Validation was also a lot of work.

I added small animations for when the form switches to the thank you screen to add a little pizzazz to the page.

### <a name="continued-development"></a>Continued Development

This project made me realize that there are many validation and credit card input masking utilities already available, and there's no need to reinvent the wheel. I think in the future, I will try to use libraries/utilities for these types of projects to cut down on development time, as well as being reassured that I'm using somethine a little more robust.

### <a name="useful-resources"></a>Useful Resources

- [How to insert space every 4 characters for IBAN registering?](https://stackoverflow.com/questions/17260238/how-to-insert-space-every-4-characters-for-iban-registering) - While this question was in reference to IBAN numbers I easily switched it over to work with credit card numbers as well.
- [https://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index](https://stackoverflow.com/questions/7208161/focus-next-element-in-tab-index) - This was really helpful in figuring out how to make an input automatically jump to the next input when it finished entering information
- [Possible to use border-radius together with a border-image which has a gradient?](https://stackoverflow.com/questions/5706963/possible-to-use-border-radius-together-with-a-border-image-which-has-a-gradient) - I used this to help make a gradient border on `focus` state of inputs.
[Make empty div of one line height](https://stackoverflow.com/questions/19347988/make-empty-div-of-one-line-height) - This was useful when trying to maintain height on error message paragraph elements even when they were empty.

## <a name="author"></a>Author

- Website - [Aaron Romanick](https://www.aaronromanick.com)
- Frontend Mentor - [@aaron-romanick](https://www.frontendmentor.io/profile/aaron-romanick)

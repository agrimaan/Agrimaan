document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile menu if open
        if (nav && nav.classList.contains('active')) {
          nav.classList.remove('active');
          menuToggle.classList.remove('active');
        }
        
        // Scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Tabs functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  if (tabButtons.length && tabPanes.length) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Show corresponding tab pane
        const target = this.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
      });
    });
  }
  
  // Testimonial slider
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  
  if (testimonialSlides.length && dots.length) {
    // Function to show a specific slide
    function showSlide(index) {
      // Hide all slides
      testimonialSlides.forEach(slide => {
        slide.style.display = 'none';
      });
      
      // Remove active class from all dots
      dots.forEach(dot => {
        dot.classList.remove('active');
      });
      
      // Show the selected slide and activate corresponding dot
      testimonialSlides[index].style.display = 'block';
      dots[index].classList.add('active');
      currentSlide = index;
    }
    
    // Initialize slider
    showSlide(0);
    
    // Add click event to dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
      });
    });
    
    // Auto-advance slides every 5 seconds
    setInterval(() => {
      let nextSlide = currentSlide + 1;
      if (nextSlide >= testimonialSlides.length) {
        nextSlide = 0;
      }
      showSlide(nextSlide);
    }, 5000);
  }
  
  // Form validation
  const contactForm = document.querySelector('.contact-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple validation
      let isValid = true;
      const name = this.querySelector('#name');
      const email = this.querySelector('#email');
      const subject = this.querySelector('#subject');
      const message = this.querySelector('#message');
      
      // Reset error states
      [name, email, subject, message].forEach(Fields => {
        Fields.style.borderColor = '';
      });
      
      // Validate required fields
      if (!name.value.trim()) {
        name.style.borderColor = 'red';
        isValid = false;
      }
      
      if (!email.value.trim()) {
        email.style.borderColor = 'red';
        isValid = false;
      } else {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          email.style.borderColor = 'red';
          isValid = false;
        }
      }
      
      if (!subject.value.trim()) {
        subject.style.borderColor = 'red';
        isValid = false;
      }
      
      if (!message.value.trim()) {
        message.style.borderColor = 'red';
        isValid = false;
      }
      
      if (isValid) {
        // In a real application, you would send the form data to a server
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
      } else {
        alert('Please fill in all required fields correctly.');
      }
    });
  }
  
  // Newsletter form
  const newsletterForm = document.querySelector('.newsletter-form');
  
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      if (!emailInput.value.trim()) {
        emailInput.style.borderColor = 'red';
        return;
      }
      
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.style.borderColor = 'red';
        return;
      }
      
      // In a real application, you would send the email to a server
      alert('Thank you for subscribing to our newsletter!');
      this.reset();
    });
  }
  
  // Sticky header
  const header = document.querySelector('.header');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
    
    lastScrollTop = scrollTop;
  });
  
  // Animate elements on scroll
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  function checkIfInView() {
    const windowHeight = window.innerHeight;
    const windowTopPosition = window.pageYOffset;
    const windowBottomPosition = windowTopPosition + windowHeight;
    
    animateElements.forEach(element => {
      const elementHeight = element.offsetHeight;
      const elementTopPosition = element.offsetTop;
      const elementBottomPosition = elementTopPosition + elementHeight;
      
      // Check if element is in viewport
      if (
        (elementBottomPosition >= windowTopPosition) &&
        (elementTopPosition <= windowBottomPosition)
      ) {
        element.classList.add('animated');
      }
    });
  }
  
  // Initial check on page load
  checkIfInView();
  
  // Check on scroll
  window.addEventListener('scroll', checkIfInView);
});
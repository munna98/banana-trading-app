// // src/components/UI/Button.jsx
// import React from 'react';

// const Button = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   disabled = false,
//   loading = false,
//   onClick,
//   type = 'button',
//   className = '',
//   icon,
//   fullWidth = false,
//   ...props
// }) => {
//   const baseClasses = `
//     inline-flex items-center justify-center font-medium rounded-md
//     focus:outline-none focus:ring-2 focus:ring-offset-2
//     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
//     ${fullWidth ? 'w-full' : ''}
//   `;

//   const variants = {
//     primary: `
//       bg-blue-600 text-white hover:bg-blue-700 
//       focus:ring-blue-500 border border-transparent
//     `,
//     secondary: `
//       bg-gray-100 text-gray-900 hover:bg-gray-200 
//       focus:ring-gray-500 border border-gray-300
//     `,
//     success: `
//       bg-green-600 text-white hover:bg-green-700 
//       focus:ring-green-500 border border-transparent
//     `,
//     danger: `
//       bg-red-600 text-white hover:bg-red-700 
//       focus:ring-red-500 border border-transparent
//     `,
//     warning: `
//       bg-yellow-500 text-white hover:bg-yellow-600 
//       focus:ring-yellow-500 border border-transparent
//     `,
//     outline: `
//       bg-transparent text-blue-600 hover:bg-blue-50 
//       focus:ring-blue-500 border border-blue-600
//     `,
//     ghost: `
//       bg-transparent text-gray-600 hover:bg-gray-100 
//       focus:ring-gray-500 border border-transparent
//     `
//   };

//   const sizes = {
//     xs: 'px-2 py-1 text-xs',
//     sm: 'px-3 py-1.5 text-sm',
//     md: 'px-4 py-2 text-sm',
//     lg: 'px-6 py-3 text-base',
//     xl: 'px-8 py-4 text-lg'
//   };

//   const buttonClasses = `
//     ${baseClasses}
//     ${variants[variant]}
//     ${sizes[size]}
//     ${className}
//   `.trim();

//   return (
//     <button
//       type={type}
//       className={buttonClasses}
//       disabled={disabled || loading}
//       onClick={onClick}
//       {...props}
//     >
//       {loading && (
//         <svg
//           className="animate-spin -ml-1 mr-2 h-4 w-4"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           />
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           />
//         </svg>
//       )}
//       {icon && !loading && (
//         <span className={children ? 'mr-2' : ''}>{icon}</span>
//       )}
//       {children}
//     </button>
//   );
// };

// // Icon Button variant
// export const IconButton = ({
//   icon,
//   variant = 'ghost',
//   size = 'md',
//   className = '',
//   ...props
// }) => {
//   const iconSizes = {
//     xs: 'p-1',
//     sm: 'p-1.5',
//     md: 'p-2',
//     lg: 'p-2.5',
//     xl: 'p-3'
//   };

//   return (
//     <Button
//       variant={variant}
//       className={`${iconSizes[size]} ${className}`}
//       {...props}
//     >
//       {icon}
//     </Button>
//   );
// };

// // Button Group component
// export const ButtonGroup = ({ children, className = '' }) => {
//   return (
//     <div className={`inline-flex rounded-md shadow-sm ${className}`}>
//       {React.Children.map(children, (child, index) => {
//         if (!React.isValidElement(child)) return child;
        
//         const isFirst = index === 0;
//         const isLast = index === React.Children.count(children) - 1;
        
//         return React.cloneElement(child, {
//           className: `
//             ${child.props.className || ''}
//             ${!isFirst ? '-ml-px' : ''}
//             ${!isFirst && !isLast ? 'rounded-none' : ''}
//             ${isFirst ? 'rounded-r-none' : ''}
//             ${isLast ? 'rounded-l-none' : ''}
//           `.trim()
//         });
//       })}
//     </div>
//   );
// };

// export default Button;
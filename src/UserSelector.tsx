import { Select } from '@radix-ui/themes'
import React, { Dispatch, SetStateAction } from 'react'

const UserSelector: React.FC<{
  username: string
  setUsername: Dispatch<SetStateAction<string>>
}> = (props) => {
  const options = [
    'hpotter',
    'hgranger',
    'rweasley',
    'kss22',
    'jsbailey',
    'bn322',
    'ma4723',
    'ab1223',
  ]

  const handleValueChange = (value: string) => {
    props.setUsername(value)
  }

  return (
    <Select.Root defaultValue={props.username} onValueChange={handleValueChange}>
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          {options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  )
}

export default UserSelector

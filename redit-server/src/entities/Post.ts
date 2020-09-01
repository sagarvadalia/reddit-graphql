import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();
  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();
  @Field()
  @Column({ unique: true })
  title!: string;
}

import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';

/**
 * Creates a custom interceptor that serializes the response from Mongoose documents to the specified class.
 *
 * @param {Type} classToIntercept - The class to serialize the response to.
 * @return {typeof ClassSerializerInterceptor} - The custom interceptor class.
 */
function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    /**
     * Converts a plain object to an instance of a class.
     *
     * @param {PlainLiteralObject} document - The plain object to convert.
     * @return {any} The converted instance of the class.
     */
    private changePlainObjectToClass(document: PlainLiteralObject) {
      if (!(document instanceof Document)) {
        return document;
      }

      return plainToClass(classToIntercept, document.toJSON());
    }

    /**
     * Prepares the response by converting it to an array of class instances if it is already an array.
     * Otherwise, it converts the response to a class instance.
     *
     * @param {PlainLiteralObject | PlainLiteralObject[]} response - The response to be prepared.
     * @return {PlainLiteralObject[] | any} - The prepared response.
     */
    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ) {
      if (Array.isArray(response)) {
        return response.map(this.changePlainObjectToClass);
      }

      return this.changePlainObjectToClass(response);
    }

    /**
     * Serializes the given response using the specified options.
     *
     * @param {PlainLiteralObject | PlainLiteralObject[]} response - The response to serialize.
     * @param {ClassTransformOptions} options - The options for serialization.
     * @return {any} The serialized response.
     */
    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}

export default MongooseClassSerializerInterceptor;
